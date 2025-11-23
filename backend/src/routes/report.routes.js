const express = require('express');
const router = express.Router();
const prisma = require('../db');

// 1. Báo cáo Tổng quan (Có lọc ngày)
router.get('/reports/summary', async (req, res) => {
    const { from, to } = req.query;
    
    // Mặc định là lấy hết nếu không chọn ngày
    let dateFilter = {};
    if (from && to) {
        dateFilter = {
            startTime: {
                gte: new Date(from),
                lte: new Date(to)
            }
        };
    }

    try {
        const completedBookings = await prisma.booking.findMany({
            where: { 
                status: 'COMPLETED',
                ...dateFilter // Áp dụng bộ lọc
            },
            include: { order: true }
        });

        let totalRevenue = 0;
        let totalCourtRevenue = 0;
        let totalDrinkRevenue = 0;

        completedBookings.forEach(b => {
            const durationHours = (new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60 * 60);
            const courtMoney = durationHours * 100000;
            const drinkMoney = b.order ? parseFloat(b.order.totalAmount) : 0;

            totalCourtRevenue += courtMoney;
            totalDrinkRevenue += drinkMoney;
        });

        totalRevenue = totalCourtRevenue + totalDrinkRevenue;

        res.json({
            totalBookings: completedBookings.length,
            totalRevenue,
            totalCourtRevenue,
            totalDrinkRevenue
        });
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});

// ... (Các API khác giữ nguyên)
// Giữ nguyên API top-players và chart
router.get('/reports/top-players', async (req, res) => {
    try {
        const topPlayers = await prisma.booking.groupBy({
            by: ['customerName', 'phoneNumber'],
            where: { status: 'COMPLETED' },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });
        res.json(topPlayers);
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});

router.get('/reports/chart', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const bookings = await prisma.booking.findMany({
            where: { status: 'COMPLETED', startTime: { gte: sevenDaysAgo } }
        });
        const chartData = {}; 
        bookings.forEach(b => {
            const date = b.startTime.toISOString().split('T')[0];
            if (!chartData[date]) chartData[date] = 0;
            chartData[date] += 1;
        });
        const result = Object.keys(chartData).map(date => ({
            date: date.split('-').slice(1).join('/'),
            count: chartData[date]
        })).sort((a,b) => a.date.localeCompare(b.date));
        res.json(result);
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});

module.exports = router;