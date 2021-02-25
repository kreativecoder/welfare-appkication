import { loan, user, saving } from "../models";
import { isEmpty, isNumberValid } from "../middleware/validate";

const uploadSavings = async (req, res, next) => {
  const { amount_saved } = req.body;
  const posted_by = req.user.id;
  const { user_id } = req.params;

  if (isEmpty(amount_saved) || !isNumberValid(amount_saved)) {
    return res.status(400).json({
      status: 400,
      error: "Please ensure amount saved is in numbers"
    });
  }
  try {
    // check if the user exist and the status is not deactivated
    const findUser = await user.findOne({ user_id });

    if (!findUser) {
      return res.status(404).json({
        error: "You cannot upload the account of a non existing user",
        status: 404
      });
    }
    const { status } = findUser.dataValues;

    if (status === "deactivated") {
      return res.status(400).json({
        error:
          "This user is not active on this platform review the user status before updating this account",
        status: 400
      });
    }
    // get user savings balance
    const userSavings = await saving.findOne({
      where: { user_id },
      order: [["updatedAt", "DESC"]]
    });

    // if user does not have any savings then create
    if (!userSavings) {
      const createSavings = await saving.create({
        user_id,
        amount_saved,
        balance: amount_saved,
        posted_by
      });
      // since a user must have savings before applying for loan if the savings has been created then terminate the operation
      if (createSavings) {
        return res.status(201).json({
          status: 201,
          message: "Savings successfully uploaded for this user"
        });
      }
      return res.status(500).json({
        status: 500,
        error: "Something went wrong please try again"
      });
    }
    // if the user has a savings already
    const { balance } = userSavings.dataValues;
    const newBalance = parseInt(balance) + parseInt(amount_saved);

    // create new savings for the user
    const updloaded = await saving.create(
      {
        balance: newBalance,
        amount_saved,
        posted_by,
        user_id
      },
      { where: { user_id } }
    );
    // check if the user has an active loan
    const findLoan = await loan.findOne({
      where: { user_id, status: "APPROVED" },
      order: [["updatedAt", "DESC"]]
    });
    // if user savings has been created successfully then update user loan with amount saved
    if (updloaded) {
      if (findLoan) {
        const { balance } = findLoan.dataValues;
        const newBalance = parseInt(balance) - parseInt(amount_saved);
        const updateLoan = await findLoan.update({
          balance: newBalance
        });
        if (!updateLoan) {
          return res.status(500).json({
            error:
              "Something happened while trying to update user loan balance",
            status: 500
          });
        }
      }
      return res.status(201).json({
        message: "You have successfully updated this user savings",
        status: 201
      });
    } else
      return res.status(500).json({
        error: "Something went wrong try again later",
        status: 500
      });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const viewSavingHistory = async (req, res, next) => {
  try {
    const findAllSavings = await saving.findAll({
      attributes: ["balance", "amount_saved", "createdAt", "updatedAt"],
      include: [
        {
          model: user,
          as: "account_owner",
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
          as: "processed_by",
          attributes: [
            "firstname",
            "lastname",
            "phone_number",
            "email",
            "branch"
          ]
        }
      ]
    });

    if (!findAllSavings) {
      return res.status(400).json({
        status: 200,
        message: "No result found"
      });
    }

    if (findAllSavings) {
      return res.status(200).json({
        status: 200,
        findAllSavings
        // count: findAllSavings.length + " results found",
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

const viewSavingOneHistory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const findAllSavings = await saving.findAll({
      where: { user_id: id },
      attributes: ["balance", "amount_saved", "createdAt", "updatedAt"],
      include: [
        {
          model: user,
          as: "account_owner",
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
          as: "processed_by",
          attributes: [
            "firstname",
            "lastname",
            "phone_number",
            "email",
            "branch"
          ]
        }
      ]
    });

    if (!findAllSavings) {
      return res.status(400).json({
        status: 200,
        message: "No result found for this user"
      });
    }

    if (findAllSavings) {
      return res.status(200).json({
        status: 200,
        findAllSavings
      });
      // count: findAllSavings.length + " results found",
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

const adminModifySaving = async (req, res, next) => {
  const { id } = req.params;
  const { amount_saved } = req.body;
  if (isEmpty(amount_saved) || !isNumberValid(amount_saved)) {
    return res.status(400).json({
      error: "Please input an amount in number",
      status: 400
    });
  }
  try {
    const transaction = await saving.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        status: 404,
        error: "Transanction does not exist"
      });
    }
    const newBalance = parseInt(amount_saved) + parseInt(transaction.balance);
    const updated = await transaction.update({
      amount_saved,
      balance: newBalance
    });
    if (updated) {
      return res.status(200).json({
        status: 200,
        message: "You have successfully updated this transaction"
      });
    } else {
      return res.status(500).json({
        error: "Something went wrong",
        status: 500
      });
    }
  } catch (error) {
    console.log(error);
    return next();
  }
};

export {
  uploadSavings,
  viewSavingHistory,
  viewSavingOneHistory,
  adminModifySaving
};
