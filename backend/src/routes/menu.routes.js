const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Lấy menu
router.get('/menu', async (req, res) => {
    try {
        const menu = await prisma.menuItem.findMany({ where: { isActive: true } });
        res.json(menu);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi lấy menu' });
    }
});

// Thêm món (Đã sửa cho an toàn)
router.post('/menu', async (req, res) => {
    const { name, price, type, imageUrl } = req.body; // Lấy đúng 4 cái cần thiết

    try {
        console.log('Dữ liệu nhận được:', req.body); // <--- Thêm dòng này để debug

        // Kiểm tra dữ liệu đầu vào
        if (!name || !price) {
            return res.status(400).json({ success: false, message: 'Tên và giá là bắt buộc' });
        }

        // Thêm món mới vào cơ sở dữ liệu
        const newItem = await prisma.menuItem.create({
            data: {
                name: name,
                price: parseFloat(price), // Chuyển đổi số
                type: type || 'drink',    // Mặc định là drink nếu thiếu
                imageUrl: imageUrl || '', // Mặc định rỗng nếu thiếu
                isActive: true
            }
        });
        res.json({ success: true, data: newItem });
    } catch (error) {
        console.error('LỖI THÊM MÓN:', error); // <--- Thêm dòng này để in lỗi ra màn hình đen
        res.status(500).json({ success: false, message: error.message });
    }
});

// Xóa món
router.delete('/menu/:id', async (req, res) => {
    try {
        await prisma.menuItem.update({
            where: { id: parseInt(req.params.id) },
            data: { isActive: false }
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;