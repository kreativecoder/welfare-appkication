import {
  loanRequest,
  adminViewAllLoans,
  userViewLoanHistory,
  respondToLoan
} from "../../controllers/loansCOntroller";
import { adminProtect, userProtect } from "../../middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/all", adminProtect, adminViewAllLoans);
router.get("/:id", userProtect, userViewLoanHistory);

router.post("/respond/:id", adminProtect, respondToLoan);
router.post("/request/:id", userProtect, loanRequest);
export default router;
