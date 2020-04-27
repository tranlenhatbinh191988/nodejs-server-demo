const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");

// @route POST api/posts
// @desc Create a post
// @access Private

router.post(
  "/create",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route GET api/posts
// @desc get list post
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).send(`Server Error: ${error}`);
  }
});

// @route GET api/posts/item?id
// @desc Get post by id
// @access Private

router.get("/item?", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.query.id);
    if (!post) {
      return res.status(400).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route DELETE api/posts/item?id
// @desc Delete a post
// @access Private

router.delete("/item?", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.query.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.post("/like/:id?", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.query.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).send(`Server Error ${error}`);
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.post("/unlike/:id?", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.query.id);
    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).send(`Server Error ${error}`);
  }
});
// @route PUT api/posts/item?:id
// @desc Update a post by id
// @access Private

router.put(
  "/item?",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { text } = req.body;
    // Build post object
    const postInfo = {};
    if (text) postInfo.text = text;
    try {
      let post = await Post.findById(req.query.id);
      if (post) {
        // Update profile
        post = await Post.findOneAndUpdate(
          req.params.id,
          { $set: postInfo },
          { new: true }
        );
        return res.json(post);
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route POST api/posts/comment/:id
// @desc Comment on a post
// @access Private

router.post(
  "/comment?",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.query.id);
      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route DELETE api/posts/comment?id?comment_id
// @desc Delete comment on a post
// @access Private

router.delete("/comment?", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.query.id_post);
    // Pull out comment
    const comment = await post.comments.find(
      (comment) => comment.id === req.query.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(400).json({ msg: "There is no comment here" });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    post.comments = post.comments.filter(
      (comment) => comment.id !== req.query.comment_id
    );
    await post.save();
    return res.json(post);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

// @route PUT api/posts/comment?id_post&comment_id
// @desc Update comment on a post
// @access Private

router.put(
  "/comment",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let post = await Post.findById(req.query.id_post);
      // Pull out comment
      const comment = await post.comments.find(
        (comment) => comment.id === req.query.comment_id
      );
      // Make sure comment exists
      if (!comment) {
        return res.status(400).json({ msg: "There is no comment here" });
      }
      // Check user
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: "User not authorized" });
      }
      const { text } = req.body;
      post.comments.map((comment) =>
        comment.id === req.query.comment_id
          ? Object.assign(comment, { text })
          : comment
      );
      await post.save();
      res.json(comment);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
