import { item, user } from "../models";
import { isEmpty, isNumberValid } from "../middleware/validate";

const addItems = async (req, res, next) => {
  const image = req.file;

  // need to clarify cost price per unit, selling price per unit, profit per unit, profit for all this quantity
  // unit = quantity bought
  // unit amount = price per one
  // selling price per unit amount= 4% of unit amount + unit amount
  // profit = (selling price - cost price)*quantity
  const { id } = req.user;
  let { unit, unit_amount, name, description } = req.body;

  const allowedTypes = ["image/png", "image/jpeg"];

  if (isEmpty(image)) {
    return res.status(400).json({
      status: 400,
      error: "Please select an image for the item"
    });
  }

  if (allowedTypes.indexOf(image.mimetype) === -1) {
    return res.status(400).json({
      status: 400,
      message: "Please upload a jpg, jpeg or png file"
    });
  }

  if (isEmpty(name) || isEmpty(description)) {
    return res.status(400).json({
      status: 400,
      error: "fill the name and description of the product"
    });
  }

  if (
    (unit && !isNumberValid(unit)) ||
    isEmpty(unit_amount) ||
    !isNumberValid(unit_amount)
  ) {
    return res.status(400).json({
      status: 400,
      error: "Please input unit, unit amount and selling price in number"
    });
  }

  unit = unit ? unit : 1;
  const selling_price = parseInt(unit_amount) + parseInt(unit_amount) * 0.04;
  const total_amount = unit * unit_amount;
  const profit = selling_price * unit - total_amount;
  const quantity_available = unit;

  try {
    const newItem = await item.create({
      added_by: id,
      unit,
      unit_amount,
      total_amount,
      img_url: image.path,
      profit,
      name,
      selling_price,
      description,
      quantity_available
    });

    if (newItem) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "You have successfully added the item"
      });
    }

    return res.status(500).json({
      status: 500,
      success: false,
      message: "Something went wrong please try again later"
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};
const viewOne = async (req, res, next) => {
  const { id } = req.params;
  try {
    const foundItem = await item.findOne({
      attributes: [
        "id",
        "name",
        "description",
        "selling_price",
        "status",
        "unit",
        "img_url",
        "quantity_available",
        ["updatedAt", "date added"]
      ],
      where: { id }
    });
    if (!foundItem) {
      return res.status(203).json({
        status: 203,
        message: "No record found for this item"
      });
    }
    return res.status(200).json({
      status: 200,
      items: foundItem
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const viewAll = async (req, res, next) => {
  try {
    const foundItem = await item.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "selling_price",
        "status",
        "unit",
        "img_url",
        "quantity_available",
        ["updatedAt", "date added"]
      ]
    });

    return res.status(200).json({
      status: 200,
      items: foundItem
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminViewAll = async (req, res, next) => {
  try {
    const foundItem = await item.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "selling_price",
        "status",
        "unit",
        "unit_amount",
        "total_amount",
        "profit",
        "img_url",
        "quantity_available",
        ["updatedAt", "date added"]
      ]
    });

    return res.status(200).json({
      status: 200,
      items: foundItem
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminViewOne = async (req, res, next) => {
  const { id } = req.params;
  try {
    const foundItem = await item.findOne({
      attributes: [
        "id",
        "name",
        "description",
        "selling_price",
        "status",
        "unit",
        "unit_amount",
        "total_amount",
        "profit",
        "img_url",
        "quantity_available",
        ["updatedAt", "date added"]
      ],
      where: { id },
      include: [
        {
          model: user,
          attributes: [
            "id",
            "firstname",
            "lastname",
            "phone_number",
            "branch",
            "status"
          ]
        }
      ]
    });

    if (!foundItem) {
      return res.status(200).json({
        status: 200,
        message: "No item found"
      });
    }

    return res.status(200).json({
      status: 200,
      items: foundItem
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminEdit = async (req, res, next) => {
  let image = req.file;

  const { id } = req.params;
  let { unit, unit_amount, name, description, quantity_available } = req.body;

  if (
    (!isEmpty(unit) && !isNumberValid(unit)) ||
    (!isEmpty(unit_amount) && !isNumberValid(unit_amount)) ||
    (!isEmpty(quantity_available) && !isNumberValid(quantity_available))
    // (!isEmpty(selling_price) && !isNumberValid(selling_price))
  ) {
    return res.status(400).json({
      status: 400,
      error:
        "Unit, Unit amount, available quantity and selling price must be numbers"
    });
  }

  const allowedTypes = ["image/png", "image/jpeg"];

  if (!isEmpty(image) && allowedTypes.indexOf(image.mimetype) === -1) {
    return res.status(400).json({
      status: 400,
      message: "Ensure your image is of type png or jpg"
    });
  }
  try {
    const originalItem = await item.findByPk(id);
    if (!originalItem) {
      return res.status(404).json({
        status: 404,
        error: "Sorry this item does not exist"
      });
    }

    const {
      img_url,
      name: dbName,
      description: dbDescription,
      unit: dbUnit,
      quantity_available: dbQuantity_available,
      // selling_price: dbSellingPrice,
      unit_amount: dbUnitAmount
    } = originalItem.dataValues;

    image = image ? image.path : img_url;
    name = name ? name : dbName;
    description = description ? description : dbDescription;
    unit = unit ? unit : dbUnit;
    quantity_available = quantity_available
      ? quantity_available
      : dbQuantity_available;
    // selling_price = selling_price ? selling_price : dbSellingPrice;
    unit_amount = unit_amount ? unit_amount : dbUnitAmount;

    // Calculate the total amount for the item
    const total_amount = unit * unit_amount;
    const toBeSoldAt = parseInt(unit_amount) + parseInt(unit_amount) * 0.04;

    const profit = unit * toBeSoldAt - total_amount;
    console.log(profit, toBeSoldAt);
    const newItem = await item.update(
      {
        unit,
        unit_amount,
        total_amount,
        img_url: image,
        profit,
        name,
        selling_price: toBeSoldAt,
        description,
        quantity_available
      },
      { where: { id } }
    );

    if (newItem) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "You have successfully updated this item"
      });
    }

    return res.status(500).json({
      status: 500,
      success: false,
      message: "Something went wrong please try again later"
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminDelete = async (req, res, next) => {
  const { id } = req.params;

  try {
    const removing = await item.findByPk(id);

    if (!removing) {
      return res.status(409).json({
        status: 409,
        error: "Sorry you cannot delete an item that does not exist"
      });
    }
    if (removing) {
      await removing.destroy(id);
      return res.status(201).json({
        status: 201,
        success: true,
        message: "Item has been successfully deleted"
      });
    } else {
      return res.status(500).json({
        status: 500,
        success: false,
        error: "Something went wrong please try again some other time"
      });
    }
  } catch (error) {
    console.log(error);
    return next();
  }
};

export {
  addItems,
  viewOne,
  viewAll,
  adminViewAll,
  adminViewOne,
  adminEdit,
  adminDelete
};
