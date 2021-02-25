import { item, user, purchase, saving, loan } from "../models";
import { isEmpty, isNumberValid } from "../middleware/validate";

const makePurchase = async (req, res, next) => {
  const user_id = req.user.id;
  const itemId = req.params.itemId;
  let { quantity } = req.body;
  // check if the item exist

  // you must have savings
  // savings balance must be greater than loan balance

  if (!isEmpty(quantity) && !isNumberValid(quantity)) {
    return res.status(400).json({
      status: 400,
      error: "Ensure item quantity is in number greater or equal to 1"
    });
  }
  if (!isEmpty(quantity) && quantity < 1) {
    return res.status(400).json({
      status: 400,
      error: "Quantity must be a number greater or equal to 1 "
    });
  }
  quantity = quantity ? parseInt(quantity) : 1;

  try {
    const getItem = await item.findOne({
      where: { id: itemId }
    });
    const { unit_amount: unit_price } = getItem;
    const total_cost = parseInt(unit_price) * quantity;
    if (!getItem) {
      return res.status(404).json({
        status: 404,
        error: "You cannot purchase an item that does not exist"
      });
    }

    if (parseInt(getItem.unit) === 0) {
      return res.status(400).json({
        status: 400,
        error:
          "This item is not available at the moment please check back later"
      });
    }
    if (quantity > getItem.unit) {
      return res.status(400).json({
        status: 400,
        error: `Sorry we have limited item of ${getItem.unit} left, kindly review the quantity ordered to be lesser or eqaul to the quantity remaining`
      });
    }

    const savingsBalance = await saving.findOne({
      attributes: ["balance"],
      where: { user_id },
      order: [["updatedAt", "DESC"]]
    });

    //check if a user has savings
    if (!savingsBalance) {
      return res.status(400).json({
        status: 400,
        error: "You do not have savings therefore you cannot make a purchase"
      });
    }

    let loanBalance = await loan.findOne({
      attributes: ["balance"],
      where: { user_id },
      order: [["updatedAt", "DESC"]]
    });

    // if a user has a loan, return the balance, else return 0
    loanBalance = loanBalance ? parseInt(loanBalance.dataValues) : 0;

    // check if the loan balance is greater than savings

    if (savingsBalance.dataValues < loanBalance.dataValues) {
      return res.status(400).json({
        status: 400,
        error:
          "Sorry You are not elligible to purchase an item because you have more loans to be paid, kindly see an admin for more clarification"
      });
    }

    // update item
    const newItemUnit = parseInt(getItem.unit) - quantity;
    const updateItem = await getItem.update({ unit: newItemUnit });
    if (!updateItem) {
      return res.status(500).json({
        status: 500,
        error: "Unable to complete this transaction please try again later"
      });
    }
    const itemPurchase = await purchase.create({
      user_id,
      quantity,
      item_id: itemId,
      total_cost,
      unit_price
    });
    if (itemPurchase) {
      return res.status(201).json({
        status: 201,
        message:
          "You have made a purchase request please check back to see if your request is approved"
      });
    }
    return res.status(500).json({
      status: 500,
      error:
        "Something went wrong while trying tto process your request please try again later"
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminViewAllPurchase = async (req, res, next) => {
  try {
    const allPurchase = await purchase.findAll({
      include: [
        {
          model: user,
          as: "purchaser",
          attributes: [
            "firstname",
            "lastname",
            "email",
            "phone_number",
            "branch"
          ]
        },
        {
          model: user,
          as: "approval",
          attributes: [
            "firstname",
            "lastname",
            "email",
            "phone_number",
            "branch"
          ]
        }
      ]
    });
    if (allPurchase.length >= 0) {
      return res.status(200).json({
        status: 200,
        data: allPurchase
      });
    } else
      return res.status(500).json({
        status: 500,
        error: "Something went wrong kindly try later"
      });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const userViewOnePurchase = async (req, res, next) => {
  const { id } = req.params;
  const { id: user_id, role } = req.user;

  try {
    // check if the role is user then return only result associated to user idif

    const onePurchase = await purchase.findOne({
      where: { item_id: id, user_id }
    });
    if (!onePurchase) {
      return res.status(404).json({
        status: 404,
        error: "You did not purchase this item"
      });
    }
    if (onePurchase) {
      return res.status(200).json({
        status: 200,
        data: onePurchase
      });
    } else
      return res.status(500).json({
        status: 500,
        error: "Something went wrong please try again later"
      });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminViewOnePurchase = async (req, res, next) => {
  const { id, itemId } = req.params;
  try {
    const getUserPurchase = await purchase.findOne({
      where: { item_id: itemId, user_id: id }
    });
    if (!getUserPurchase) {
      return res.status(404).json({
        status: 404,
        error: "This user did not purchase this item"
      });
    }
    if (getUserPurchase) {
      return res.status(200).json({
        status: 200,
        data: getUserPurchase
      });
    } else
      return res.status(500).json({
        status: 500,
        error: "Something went wrong please try again later"
      });
  } catch (error) {
    console.log(error);
    return next();
  }
};
const userViewAllPurchase = async (req, res, next) => {
  const { id } = req.user;
  try {
    const getUserPurchase = await purchase.findAll({
      where: { user_id: id }
    });
    console.log(getUserPurchase);

    if (getUserPurchase.length === 0) {
      return res.status(404).json({
        status: 404,
        error: "You didnt have any purchase history"
      });
    }
    if (getUserPurchase) {
      return res.status(200).json({
        status: 200,
        data: getUserPurchase
      });
    } else
      return res.status(500).json({
        status: 500,
        error: "Something went wrong please try again later"
      });
  } catch (error) {
    console.log(error);
    return next();
  }
};
const adminViewAllPurchaseRequest = async (req, res, next) => {
  try {
    const getAllPurchase = await purchase.findAll({
      where: { status: "PENDING" },
      include: {
        model: user,
        as: "purchaser",
        attributes: [
          "firstname",
          "lastname",
          "email",
          "phone_number",
          "branch",
          "employed_as",
          "monthly_savings"
        ]
      }
    });

    if (getAllPurchase.length === 0) {
      return res.status(404).json({
        status: 404,
        error: "There is no pending request"
      });
    }
    if (getAllPurchase) {
      return res.status(200).json({
        status: 200,
        data: getAllPurchase
      });
    } else
      return res.status(500).json({
        status: 500,
        error: "Something went wrong please try again later"
      });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminRespondToPurchase = async (req, res, next) => {
  //, purchase_id
  const { purchase_id } = req.params;
  const { id: adminId } = req.user;
  const { respond, reason } = req.body;
  if (isEmpty(respond)) {
    return res.status(400).json({
      error: "Please select an action to respond to this purchase",
      status: 400
    });
  }
  if (respond === "DECLINE" && !reason) {
    return res.status(400).json({
      error: "You must state a clear reason for declinig the purchase request",
      status: 400
    });
  }
  try {
    const getPurchase = await purchase.findByPk(purchase_id);
    console.log(getPurchase, "result for purchase");
    if (!getPurchase) {
      return res.status(404).json({
        status: 404,
        error:
          "No purchase request with this transaction Id or the item cannot be found, please check if the tansaciton exist as well as the item"
      });
    }
    const getItem = await item.findByPk(getPurchase.item_id);
    if (!getItem) {
      return res.status(404).json({
        status: 404,
        error:
          "No purchase request with this transaction Id or the item cannot be found, please check if the tansaciton exist as well as the item"
      });
    }
    if (respond === "APPROVE") {
      if (getPurchase.status !== "PENDING") {
        return res.status(403).json({
          error:
            "You cannot modify purchase that has been prevviously responded to",
          status: 403
        });
      }
      const approvePurchase = await getPurchase.update({
        status: "APPROVED",
        approved_by: adminId
      });
      if (approvePurchase) {
        return res.status(203).json({
          status: 203,
          message: "You have succeffully responded to this purchase request"
        });
      } else
        return res.status(500).json({
          error: "Something went wrong please try again later",
          status: 500
        });
    }
    if (getPurchase.status !== "PENDING") {
      return res.status(403).json({
        error:
          "You cannot modify or respond to request that has been attended to",
        status: 400
      });
    }
    const reverseQuantity = await getItem.update({
      quantity: getPurchase.quantity
    });


    const declinePurchase = await getPurchase.update({
      status: "DECLINED",
      reason,
      approved_by: adminId
    });
    if (reverseQuantity && declinePurchase) {
      return res.status(200).json({
        status: 200,
        message: "You have successfull responded to this transaction"
      });
    }
    return res.status(500).json({
      status: 500,
      error: "Something went wrong please try again later"
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

export {
  makePurchase,
  adminViewAllPurchase,
  userViewOnePurchase,
  adminViewOnePurchase,
  userViewAllPurchase,
  adminViewAllPurchaseRequest,
  adminRespondToPurchase
};
