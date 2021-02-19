$(document).ready(() => {
    $.get(`/api/posts/${postId}`, results => {
        console.log(results);
        outputPostsWithReply(results, $(".postsContainer"));
    });
});