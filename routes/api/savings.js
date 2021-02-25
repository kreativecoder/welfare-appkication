import {uploadSavings, viewSavingHistory, viewSavingOneHistory, adminModifySaving} from '../../controllers/savingsController';
import {adminProtect, userProtect} from '../../middleware/auth'
import {Router} from 'express';

const router = Router();
router.get('/view/histories/:id', userProtect, viewSavingOneHistory);
router.get('/view/all/histories', adminProtect, viewSavingHistory);
router.patch('/edit/:id', adminProtect, adminModifySaving);

router.post('/upload/:user_id', adminProtect, uploadSavings);
export default router;