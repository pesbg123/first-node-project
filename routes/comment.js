const express = require('express');
const router = express.Router();
const Posts = require('../schemas/posts');
const Comments = require('../schemas/comments');

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

module.exports = router;
