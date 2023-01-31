const Blog = require("../models/blog");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getBlogById = (req, res, next, id) => {
  id = id.trim();
  Blog.findById(id).exec((err, blog) => {
    if (err || !blog) {
      return res.status(400).json({
        error: "Blog Not Found",
      });
    }
    req.blog = blog;

    next();
  });
};

exports.createBlog = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }
    //destructure of fields
    const { name, description } = fields;
    req.profile.salt = undefined;
    req.profile.encry_password = undefined;
    req.profile.createdAt = undefined;
    req.profile.updatedAt = undefined;
    fields.creadtedBy = req.profile;

    if (!name || !description) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    let blog = new Blog(fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big",
        });
      }
      blog.photo.data = fs.readFileSync(file.photo.path);
      blog.photo.contentType = file.photo.type;
    }

    //save to db
    blog.save((err, blog) => {
      if (err) {
        return res.status(400).json({
          eror: "Saving blog in Db failed",
        });
      }
      res.json(blog);
    });
  });
};

exports.getBlog = (req, res) => {
  req.blog.photo = undefined;
  return res.json(req.blog);
};

//middleare
exports.photo = (req, res, next) => {
  if (req.blog.photo.data) {
    res.set("Content-Type", req.blog.photo.contentType);
    return res.send(req.blog.photo.data);
  } else {
    if (req.blog) {
      res.json({
        message: "This blog does not have an image",
      });
    }
  }
  next();
};

exports.deleteBlog = (req, res) => {
  let blog = req.blog;

  // console.log(blog.creadtedBy._id.toString() == req.profile._id.toString());

  if (blog.creadtedBy._id.toString() == req.profile._id.toString()) {
    blog.remove((err, deletedBlog) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to delete blog",
        });
      }
      res.json({
        message: "Blog Deleted",
        deletedBlog,
      });
    });
  } else {
    res.json({
      message: "You are not authorized to  delete this blog",
    });
  }
};

exports.updateBlog = (req, res) => {
  let blog = req.blog;

  if (blog.creadtedBy._id.toString() == req.profile._id.toString()) {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
      if (err) {
        return res.status(400).json({
          error: "problem with image",
        });
      }

      //updation code

      blog = _.extend(blog, fields);

      //handle file here
      if (file.photo) {
        if (file.photo.size > 3000000) {
          return res.status(400).json({
            error: "File size too big",
          });
        }
        blog.photo.data = fs.readFileSync(file.photo.path);
        blog.photo.contentType = file.photo.type;
      }

      //save to db
      blog.save((err, blog) => {
        if (err) {
          return res.status(400).json({
            eror: "Updation of blog failed",
          });
        }
        res.json(blog);
      });
    });
  } else {
    res.json({
      message: "You are not authorized to update this blog",
    });
  }
};

//blog listing

exports.getAllBlogs = (req, res) => {
  // console.log(parseInt(req.query.page) - 1);
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let page = req.query.page ? (parseInt(req.query.page) - 1) * 10 : 0;
  let sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";

  Blog.find()
    .select("-photo")
    .populate("createdBy")
    .sort([[sortBy, -1]])
    .limit(limit)
    .skip(page)
    .exec((err, blogs) => {
      if (err) {
        return res.status(400).json({
          error: "No blog found",
        });
      }

      res.json(blogs);
    });
};
