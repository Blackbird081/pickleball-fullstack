    const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { format } = require('date-fns');

// 1. Đăng nhập
router.post('/admin/login', (req, res) => {
    const inputPassword = req.body.password;
    // 👇 GHI CỨNG LUÔN ĐỂ TEST (Bỏ qua biến môi trường tạm thời)
    const adminPassword = 'admin123'; 

    console.log(`Login Check: Nhập="${inputPassword}" vs Đúng="${adminPassword}"`);

    if (inputPassword === adminPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Sai mật khẩu' });
    }
});

// 2. Lấy danh sách chờ
router.get('/admin/pending', async (req, res) => {
    try {
        const list = await prisma.booking.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(list);
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});
// API MỚI: Lấy danh sách khách ĐÃ DUYỆT trong hôm nay
router.get('/admin/today', async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const list = await prisma.booking.findMany({
            where: { 
                status: 'CONFIRMED', // Chỉ lấy vé đã duyệt
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: { startTime: 'asc' } // Sắp xếp theo giờ đá
        });
        res.json(list);
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});
// 3. Duyệt/Hủy
router.post('/approve', async (req, res) => {
    await prisma.booking.update({ where: { id: req.body.bookingId }, data: { status: 'CONFIRMED' } });
    res.json({ success: true });
});
router.post('/reject', async (req, res) => {
    await prisma.booking.update({ where: { id: req.body.bookingId }, data: { status: 'CANCELLED' } });
    res.json({ success: true });
});

// 4. Khóa sân
router.post('/maintenance', async (req, res) => {
    const { courtId, startTime, endTime, reason } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);
    try {
        const conflict = await prisma.booking.findFirst({
            where: {
                courtId: parseInt(courtId),
                status: { in: ['CONFIRMED', 'PENDING'] },
                AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }]
            }
        });
        if (conflict) return res.status(400).json({ success: false, message: 'Đang có khách đặt giờ này!' });

        await prisma.booking.create({
            data: {
                courtId: parseInt(courtId),
                customerName: `BẢO TRÌ: ${reason}`,
                phoneNumber: 'ADMIN',
                startTime: start,
                endTime: end,
                bookingRef: `LOCK-${Date.now().toString().slice(-4)}`,
                status: 'CONFIRMED'
            }
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 5. Check-in
router.post('/checkin', async (req, res) => {
    const { bookingRef } = req.body;
    try {
        const booking = await prisma.booking.findUnique({ where: { bookingRef } });
        if (!booking) return res.status(404).json({ success: false, message: 'Vé không tồn tại!' });
        if (booking.status === 'PENDING') return res.status(400).json({ success: false, message: 'Vé CHƯA ĐƯỢC DUYỆT!' });
        if (booking.status === 'COMPLETED') return res.status(400).json({ success: false, message: 'Vé đã dùng!' });
        if (booking.status === 'CANCELLED') return res.status(400).json({ success: false, message: 'Vé đã hủy!' });

        await prisma.booking.update({ where: { id: booking.id }, data: { status: 'COMPLETED' } });
        res.json({ 
            success: true, 
            message: 'HỢP LỆ!', 
            data: { court: booking.courtId, customer: booking.customerName }
        });
    } catch (error) { res.status(500).json({ success: false, message: 'Lỗi' }); }
});

module.exports = router;