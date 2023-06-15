const express = require('express');
const router = express.Router();

// Posts 모델을 가져옵니다.
const Posts = require('../schemas/posts.js');

// 전체 게시글 조회 API
router.get('/posts', async (req, res) => {
  try {
    const posts = await Posts.find()
      .select('-password -content -__v')
      .sort({ createdAt: -1 });
    // 데이터베이스에서 mongoos메서드 select를 사용해서 특정 필드들을 제외 한 후
    // 나머지 게시물을 조회하고, 작성 날짜 기준으로 내림차순으로 정렬합니다.

    // 조회된 게시물을 응답합니다.
    res.json({ data: posts });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 게시글 작성 API
router.post('/posts', async (req, res) => {
  const { user, password, title, content } = req.body;

  // 이미 존재하는 게시물인지 확인합니다.
  const existingPosts = await Posts.find({ user });
  if (existingPosts.length) {
    return res.status(400).json({
      success: false,
      errorMessage: '중복되는 게시물이 존재합니다.',
    });
  }

  // 새로운 게시물을 생성합니다.
  const createdPosts = await Posts.create({
    user,
    password,
    title,
    content,
    createdAt: new Date(),
  });

  // 생성된 게시물을 응답합니다.
  res.json({ posts: '게시물을 생성하였습니다.' });
});

// 게시글 상세 조회 API
router.get('/posts/:_id', async (req, res) => {
  const { _id } = req.params;

  try {
    // MongoDB에서 해당 _id를 가진 게시물을 조회합니다.
    const post = await Posts.findById(_id)
      .select('-password -content -__v')
      .sort({ createdAt: -1 });

    if (!post) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 조회된 게시물을 응답합니다.
    res.json({ data: post });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 게시글 수정 API
router.put('/posts/:_id', async (req, res) => {
  const { _id } = req.params;
  const { password, title, content } = req.body;

  try {
    // MongoDB에서 해당 _id와 password를 가진 게시물을 조회합니다.
    const post = await Posts.findOne({ _id, password });

    if (!post) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 게시물을 업데이트합니다.
    await Posts.updateOne({ _id, password }, { $set: { title, content } });

    // 수정된 게시물을 응답합니다.
    res.json({ message: '게시물 수정에 성공했습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 수정에 실패했습니다.' });
  }
});

// 게시글 삭제 API
router.delete('/posts/:_id', async (req, res) => {
  const { _id } = req.params;
  const { password } = req.body;

  try {
    // MongoDB에서 해당 _id를 가진 게시물을 조회합니다.
    const post = await Posts.findById(_id);

    if (!post) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 비밀번호를 비교하여 일치하지 않을 경우 에러 응답을 보냅니다.
    if (post.password !== password) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // MongoDB에서 해당 _id를 가진 게시물을 삭제합니다.
    const deletedPost = await Posts.findByIdAndDelete(_id);

    // 삭제된 게시물을 응답합니다.
    res.json({ message: '게시물이 삭제 되었습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물이 삭제되지 않았습니다.' });
  }
});

module.exports = router;
