const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Lấy đơn hàng
router.get('/orders/:bookingId', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { bookingId: parseInt(req.params.bookingId) },
            include: { items: { include: { menuItem: true } } }
        });
        res.json(order || { items: [], totalAmount: 0 });
    } catch (error) { res.status(500).json({ error: 'Lỗi' }); }
});

// Thêm món
router.post('/orders/add', async (req, res) => {
    const { bookingId, menuItemId } = req.body;
    try {
        let order = await prisma.order.findUnique({ where: { bookingId } });
        if (!order) order = await prisma.order.create({ data: { bookingId } });

        const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
        const existingItem = await prisma.orderItem.findFirst({ where: { orderId: order.id, menuItemId } });

        if (existingItem) {
            await prisma.orderItem.update({
                where: { id: existingItem.id },
                data: { quantity: { increment: 1 }, amount: { increment: menuItem.price } }
            });
        } else {
            await prisma.orderItem.create({
                data: { orderId: order.id, menuItemId, price: menuItem.price, amount: menuItem.price, quantity: 1 }
            });
        }
        await prisma.order.update({ where: { id: order.id }, data: { totalAmount: { increment: menuItem.price } } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// Xóa món
router.post('/orders/remove', async (req, res) => {
    const { orderItemId } = req.body;
    try {
        const item = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
        await prisma.order.update({ where: { id: item.orderId }, data: { totalAmount: { decrement: item.price } } });
        if (item.quantity > 1) {
            await prisma.orderItem.update({ where: { id: orderItemId }, data: { quantity: { decrement: 1 }, amount: { decrement: item.price } } });
        } else {
            await prisma.orderItem.delete({ where: { id: orderItemId } });
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// Thanh toán
router.post('/orders/pay', async (req, res) => {
    const { bookingId } = req.body;
    try {
        const order = await prisma.order.findUnique({ where: { bookingId } });
        const drinkTotal = order ? parseFloat(order.totalAmount) : 0;
        await prisma.$transaction([
            prisma.booking.update({ where: { id: bookingId }, data: { status: 'COMPLETED' } }),
            prisma.order.upsert({
                where: { bookingId },
                update: { status: 'PAID', totalAmount: drinkTotal },
                create: { bookingId, status: 'PAID', totalAmount: 0 }
            })
        ]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

module.exports = router;