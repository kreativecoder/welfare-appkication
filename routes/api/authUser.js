import { Router } from "express";
import {
  addUser,
  userLogin,
  adminViewAll,
  adminViewOne,
  adminViewBranch,
  userProfile,
  userUpdateProfile
} from "../../controllers/authUserController";
import parser from '../../config/cloudinaryConfig';
import { adminProtect, userProtect } from "../../middleware/auth";

const router = Router();

router.get("/admin/viewone/:id", adminProtect, adminViewOne);
router.get("/admin/viewall/branch", adminProtect, adminViewBranch);
router.get("/admin/viewall", adminProtect, adminViewAll);
router.get("/profile/:id", userProtect, userProfile)
router.patch('/update/:id', userProtect, parser.single('image'), userUpdateProfile)
router.post("/add", adminProtect, addUser);
router.post("/login", userLogin);

export default router;
