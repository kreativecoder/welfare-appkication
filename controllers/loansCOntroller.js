import { loan, user, saving } from "../models";
import { isEmpty, isNumberValid } from "../middleware/validate";

const loanRequest = async (req, res, next) => {
  const { id } = req.params;
  const { amount, repayment, purpose } = req.body;

  if (isEmpty(amount) || isEmpty(repayment) || isEmpty(purpose)) {
    return res.status(400).json({
      status: 400,
      error: "Fill all the required fields to perform this transaction"
    });
  }

  if (!isNumberValid(amount) || !isNumberValid(repayment)) {
    return res.status(400).json({
      status: 400,
      error:
        "Amount to be collected should be in number while repayment should be the number of months you wish the loan be deducted"
    });
  }
  try {
    //Perform a serach to check if the user has a loan
    const checkUserLoan = await loan.findOne({
      attributes: ["balance"],
      where: { user_id: id },
      order: [["createdAt", "DESC"]]
    });

    // const findUser = await saving.findOne({where: {user_id}})
    if (checkUserLoan) {
      const { balance, status } = checkUserLoan.dataValues;
      const checkBalance = parseInt(balance);
      if (checkBalance > 1 || status === "PENDING") {
        return res.status(403).json({
          status: 403,
          error:
            "You have previously made a loan request that is pending or you have a loan you are currently servicing, kindly try later when your loan has been fully settled or contact an admin to see to your pending loan reguest"
        });
      }
    }
    const checkUserSavings = await saving.findOne({
      attributes: ["balance"],
      where: { user_id: id },
      order: [["createdAt", "DESC"]]
    });

    if (!checkUserSavings) {
      return res.status(403).json({
        status: 403,
        error:
          "You are not elligle for laon because you currently do not have a saving"
      });
    }
    const amountRequested = parseInt(amount);
    const amountSaved = parseInt(checkUserSavings.dataValues.balance);
    const monthOfpayment = parseInt(repayment);
    const checkEligible = amountSaved * 0.7 * 2;
    const sevenPercent = amountRequested * 0.07;
    const fivePercent = amountRequested * 0.05;
    const interest = monthOfpayment <= 12 ? fivePercent : sevenPercent;
    // console.log("Interest",interest, "amount ellible to cllect",checkEligible);
    if (amountRequested > checkEligible) {
      return res.status(403).json({
        status: 403,
        error:
          "You are not ellible to collect this amount you specified, kindly reduce it or contact the admin"
      });
    }
    const totalLoanBal = amountRequested + interest;
    const makeLoan = await loan.create({
      user_id: id,
      amount,
      interest,
      repayment: monthOfpayment,
      balance: totalLoanBal,
      purpose
    });

    if (makeLoan) {
      return res.status(201).json({
        status: 201,
        message:
          "Thank you for making a loan request, your loan request is pending and awaiting admin approval, kindly check back to see if your request is approved by an admin"
      });
    }
    // Math.max(
    //   ...array.map(function(o) {
    //     return o.y;
    //   })
    // );

    return res.status(500).json({
      status: 500,
      error: "Your request cannot be completed at this time kindly try later"
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminViewAllLoans = async (req, res, next) => {
  try {
    const allLoans = await loan.findAll({
      attributes: [
        "amount",
        "interest",
        "repayment",
        "date_treeted",
        "balance",
        "purpose",
        "admin_comment",
        "status",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: user,
          as: "owner",
          attributes: [
            "firstname",
            "lastname",
            "phone_number",
            "email",
            "img_url",
            "branch",
            "monthly_savings",
            "account_number",
            "bank_name",
            "status"
          ]
        },
        {
          model: user,
          as: "approver",
          attributes: ["firstname", "lastname", "email", "phone_number"]
        }
      ],
      order: [["updatedAt", "DESC"]]
    });

    if (allLoans) {
      return res.status(200).json({
        status: 200,
        allLoans
      });
    } else
      return res.status(500).json({
        status: 500,
        message: "Something went wrong please try again"
      });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const userViewLoanHistory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userLoan = await loan.findOne({
      where: { user_id: id },
      attributes: [
        "amount",
        "interest",
        "repayment",
        "date_treeted",
        "balance",
        "purpose",
        "admin_comment",
        "status",
        "createdAt"
      ],
      include: [
        {
          model: user,
          as: "owner",
          attributes: [
            "firstname",
            "lastname",
            "phone_number",
            "email",
            "img_url",
            "branch",
            "monthly_savings",
            "account_number",
            "bank_name",
            "status"
          ]
        }
      ],
      order: [["updatedAt", "DESC"]]
    });

    if (!userLoan) {
      return res.status(200).json({
        status: 200,
        message: "You currently do not have any loan"
      });
    }
    if (userLoan) {
      return res.status(200).json({
        status: 200,
        message: "User loans",
        userLoan
      });
    } else {
      return res.status(500).json({
        status: 500,
        error:
          "Your request cannot be completed at this time please try again later"
      });
    }
  } catch (error) {
    console.log(error);
    return next();
  }
};

const respondToLoan = async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const { respond } = req.body;
  let admin_commenting = req.body.admin_comment;

  try {
    const findUser = await loan.findOne({
      where: { user_id: id, status: "PENDING" },
      include: [
        {
          model: user,
          as: "owner",
          attributes: [
            "firstname",
            "lastname",
            "phone_number",
            "email",
            "img_url",
            "branch",
            "monthly_savings",
            "account_number",
            "bank_name",
            "status"
          ]
        }
      ],
      order: [["updatedAt", "DESC"]]
    });
    if (!findUser) {
      return res.status(404).json({
        status: 404,
        error: "This user does not have a pending loan application"
      });
    }

    if (isEmpty(respond)) {
      return res.status(400).json({
        status: 400,
        error: "Please respond to user loan request to proceed"
      });
    }

    if (respond === "DECLINE" && !admin_commenting) {
      return res.status(400).json({
        status: 400,
        error: "Please state a reason for loan decline"
      });
    }

    const date_treeted = respond === "DECLINE" ? null : new Date();
    const admin_comment = admin_commenting;
    const treeted_by = adminId;
    const status = respond === "DECLINE" ? "DECLINED" : "APPROVED";

    const updateLoan = await findUser.update({
      status,
      admin_comment,
      date_treeted,
      treeted_by
    });
    if (updateLoan) {
      return res.status(201).json({
        status: 201,
        message: "Loan request has been treeted successfully "
      });
    }

    return res.status(500).json({
      status: 500,
      error: "Something went wrong please try later"
    });
  } catch (error) {}
};

export { loanRequest, adminViewAllLoans, userViewLoanHistory, respondToLoan };
