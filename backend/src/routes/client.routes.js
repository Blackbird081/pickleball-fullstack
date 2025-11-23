const express = require('express');
const router = express.Router();
const prisma = require('../db');
const QRCode = require('qrcode');
const { format } = require('date-fns');

// 1. Lấy lịch
router.get('/bookings', async (req, res) => {
    const { date, courtId } = req.query;
    if (!date) return res.json([]);
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                courtId: courtId ? parseInt(courtId) : undefined,
                status: { in: ['CONFIRMED', 'COMPLETED', 'PENDING'] },
                startTime: { gte: startOfDay, lte: endOfDay }
            }
        });
        res.json(bookings);
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});

// 2. Đặt sân
router.post('/bookings', async (req, res) => {
    const { courtId, customerName, phoneNumber, startTime, endTime } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);
    try {
        const result = await prisma.$transaction(async (tx) => {
            const conflict = await tx.booking.findFirst({
                where: {
                    courtId: parseInt(courtId),
                    status: { in: ['CONFIRMED', 'COMPLETED', 'PENDING'] },
                    AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }]
                }
            });
            if (conflict) throw new Error('Giờ này đã có người đặt/chờ duyệt!');
            
            const bookingRef = `PKB-${Date.now().toString().slice(-6)}`;
            const qrData = JSON.stringify({ ref: bookingRef, name: customerName });
            // 👇 SỬA DÒNG NÀY: Thêm tham số width: 600 (pixel)
            const qrImage = await QRCode.toDataURL(qrData, { 
                width: 600,  // Độ phân giải cao (Nét căng)
                margin: 2,   // Viền trắng xung quanh
                color: {
                    dark: '#000000',  // Màu đen
                    light: '#ffffff'  // Nền trắng
                }
            });

            return await tx.booking.create({
                data: {
                    courtId: parseInt(courtId),
                    customerName,
                    phoneNumber,
                    startTime: start,
                    endTime: end,
                    bookingRef,
                    qrCodeData: qrImage,
                    status: 'PENDING'
                }
            });
        });
        res.json({ success: true, data: result });
    } catch (error) { res.status(400).json({ success: false, error: error.message }); }
});

// 3. Tra cứu vé
router.get('/my-bookings', async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.json([]);
    try {
        const bookings = await prisma.booking.findMany({
            where: { phoneNumber: phone, status: { in: ['CONFIRMED', 'PENDING'] } },
            orderBy: { startTime: 'desc' }
        });
        res.json(bookings);
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});

module.exports = router;