const express = require('express');
const router = express.Router();
const Posts = require('../schemas/posts');
const Comments = require('../schemas/comments');

// 전체 코멘트 조회 API
router.get('/posts/:_id/comments', async (req, res) => {
  const { _id } = req.params;

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.findById(_id);
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 게시물에 연결된 모든 코멘트를 조회합니다.
    const comments = await Comments.find({ postId: _id })
      .select('-postId -__v')
      .sort({ createdAt: -1 });

    res.json({ data: comments });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 코멘트 작성 API
router.post('/posts/:_id/comments', async (req, res) => {
  const { user, comment } = req.body;
  const { _id } = req.params;

  // 한 글자도 입력하지 않았을 상황에 대한 예외처리
  if (!comment) {
    return res.status(400).json({
      success: false,
      error: '코멘트를 입력해주세요',
    });
  }

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.findById(_id);
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 코멘트를 저장합니다.
    await Comments.create({
      postId: _id,
      user,
      comment,
      createdAt: new Date(),
    });

    // 생성된 코멘트를 응답합니다.
    res.json({ message: '댓글을 작성하였습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
  }
});

// 코멘트 수정 API
router.put('/posts/:postId/comments/:_id', async (req, res) => {
  const { user, comment } = req.body;
  const { postId, _id } = req.params;

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 코멘트의 존재 여부를 확인합니다.
    const existingComment = await Comments.findById(_id);
    if (!existingComment) {
      return res.status(404).json({ error: '코멘트를 찾을 수 없습니다.' });
    }

    // 코멘트를 업데이트합니다.
    existingComment.user = user;
    existingComment.comment = comment;
    await existingComment.save();

    // 업데이트된 코멘트를 응답합니다.
    res.json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '댓글 수정에 실패했습니다.' });
  }
});

// 코멘트 삭제 API
router.delete('/posts/:postId/comments/:_id', async (req, res) => {
  const { postId, _id } = req.params;

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 코멘트의 존재 여부를 확인합니다.
    const existingComment = await Comments.findOne({ _id });
    if (!existingComment) {
      return res.status(404).json({ error: '코멘트를 찾을 수 없습니다.' });
    }

    // 코멘트를 삭제합니다.
    await Comments.deleteOne({ _id });

    res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
  }
});

module.exports = router;
