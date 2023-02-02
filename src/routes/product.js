const router = require("express").Router();
const Product = require("../models/Product");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");

//CREATE PRODUCT

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE PRODUCT
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.size.unshift("Escoge un número");
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qAsc = req.query.asc;
  const qDsc = req.query.dsc;

  try {
    let products;
    if (qCategory && qNew) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      }).sort({ createdAt: -1 });
    } else if (qCategory && qAsc) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      }).sort({ price: 1 });
    } else if (qCategory && qDsc) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      }).sort({ price: -1 });
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

//SEARCH PRODUCT - AUTOCOMPLETE
router.get("/search", async (req, res) => {
  try {
    const title = req.query.title;
    const agg = [
      {
        $search: {
          index: "productsIndex",
          autocomplete: {
            query: title,
            path: "title",
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          desc: 1,
          price: 1,
          img: 1,
          inStock: 1,
        },
      },
    ];
    const response = await Product.aggregate(agg);
    if (response.length > 0) {
      return res.status(200).json(response);
    } else {
      return res.json("No se ha encontrado ningun producto con este criterio");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get("/search/category", async (req, res) => {
  try {
    const title = req.query.title;
    const category = req.query.category;
    const agg = [
      {
        $search: {
          index: "productsIndex",
          autocomplete: {
            query: title,
            path: "title",
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      },
      {
        $limit: 5,
      },
      {
        $match: {
          categories: category,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          desc: 1,
          price: 1,
          img: 1,
          inStock: 1,
        },
      },
    ];
    const response = await Product.aggregate(agg);
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.json([]);
  }
});

module.exports = router;
