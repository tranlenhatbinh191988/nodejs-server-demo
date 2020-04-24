const express = require("express");
const router = express.Router();
const normalize = require("normalize-url");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");
const config = require("config");
const request = require("request");

{
  /*
 @route /api/profile
 @desc api for user create profile
@access   Private
*/
}

router.post(
  "/create",
  [auth, check("skills", "Skills is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    const profileFields = {
      id: req.user.id,
      company,
      location,
      website: website === "" ? "" : normalize(website, { forceHttps: true }),
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
      status,
      githubusername,
    };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }

    profileFields.social = socialfields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get("/github/:username?", (req, res) => {
  try {
    const options = {
      uri: encodeURI(
        `https://api.github.com/users/${req.query.username}/repos?per_page=5&sort=created:asc`
      ),
      method: "GET",
      headers: {
        "user-agent": "node.js",
        Authorization: `token ${config.get("githubToken")}`,
      },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);
      // console.log("response", response);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get(
  '/',
  async(req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar'])
      res.json(profiles)
    } catch(err) {
      console.log(err.message)
      res.status(500).send('Server error')
    }
  }
)

// @route GET api/profile/user/:user_id
// @desc Get profile by user ID
// @access Public
router.get(
  '/user?',
  async (req, res) => {
    try {
      const profile = await Profile.findOne({user: req.query.user_id}).populate('user', ['name', 'avatar'] )
      if(!profile) return res.status(400).json({msg: "Profile not found"})
      res.json(profile)
    } catch (err) {
      console.log(err.message)
      if(err.kind === 'ObjectId'){
        return res.status(400).json({msg: "Profile not found"})
      }
      res.status(500).send('Server error')
    }
  }
)

module.exports = router;
