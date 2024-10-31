const router = require('express').Router();
const authRoutes = require('./auth.routes');
const serverRoutes = require('./server.routes');
const planRoutes = require('./plan.routes');
const nodeRoutes = require('./node.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/servers', serverRoutes);
router.use('/plans', planRoutes);
router.use('/admin/nodes', nodeRoutes);
router.use('/admin', adminRoutes);

module.exports = router; 