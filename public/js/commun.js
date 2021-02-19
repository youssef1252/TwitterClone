$("#postTextarea, #replyTextarea").keyup(event => {

    let textbox = $(event.target);
    let valueText = textbox.val().trim();
    let isModal = textbox.parents('.modal').length == 1;
    let sbmitButton = isModal ? $("#submitReplyButton") : $("#sbmitPostButton");
    if(valueText) {
        sbmitButton.prop('disabled', false);
        return;
    }
    sbmitButton.prop('disabled', true);

});

$("#sbmitPostButton, #submitReplyButton").on('click', event => {

    let sbmitButton = $(event.target);
    let isModal = sbmitButton.parents('.modal').length == 1;
    let textbox = isModal ? $("#replyTextarea") : $("#postTextarea");
    let data = {
        content: textbox.val()
    };

    if (isModal) {
        const postId = sbmitButton.data().id;
        if (postId == null) return console.log("Button id is null");
        data.replyTo = postId;
    }
    $.post('/api/posts', data, (postData) => {

        if (postData.replyTo) {
            location.reload();
        } else {
            let html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            sbmitButton.prop('disabled', true);
        }
        
    });

});

$("#replyModal").on("show.bs.modal", (event) => {

    var retweetButton = $(event.relatedTarget);
    const postId = getPostIdFromElement(retweetButton);

    $("#submitReplyButton").data("id", postId);
    $.get(`/api/posts/${postId}`, results => {
        outputPosts(results.postData, $("#originalPostContainer"));
    });

});

$("#replyModal").on("hidden.bs.modal", () => {

    $("#originalPostContainer").html("");
    $("#replyTextarea").val("");

});

$(document).on('click', '.likeButton', event => {

    var likeButton = $(event.target);
    const postId = getPostIdFromElement(likeButton);
    if(postId === undefined) return;
    $.ajax({
        type: "PUT",
        url: `/api/posts/${postId}/like`,
        success: (response) => {
            likeButton.find("span").text(response.likes.length || '');
            if(response.likes.includes(userLoggedIn._id)) {
                likeButton.addClass("active");
            } else {
                likeButton.removeClass("active");
            }
        }
    });

});

$(document).on('click', '.retweetButton', event => {

    let retweetButton = $(event.target);
    const postId = getPostIdFromElement(retweetButton);
    if(postId === undefined) return;
    $.ajax({
        type: "POST",
        url: `/api/posts/${postId}/retweet`,
        success: (response) => {

            retweetButton.find("span").text(response.retweetUsers.length || '');
            if(response.retweetUsers.includes(userLoggedIn._id)) {
                retweetButton.addClass("active");
            } else {
                retweetButton.removeClass("active");
            }

        }
    });

});

$(document).on('click', '.post', event => {

    let element = $(event.target);
    const postId = getPostIdFromElement(element);

    if (postId !== undefined && !element.is('button')) {
        window.location.href = `/posts/${postId}`;
    }
});

function getPostIdFromElement(element) {

    let isRoot = element.hasClass('post');
    let rootElement = isRoot ? element : element.closest('.post');
    let postId = rootElement.data().id;
    if (postId === undefined) return alert('Post id not found');
    return postId;

}

function createPostHtml(postData, largeFont = false) {

    if (postData._id == null) return console.log("Post object is null");

    const isRetweet = postData.retweetData !== undefined;
    const retweetBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;
    const postedBy = postData.postedBy;

    if (postedBy._id === undefined) return console.log("User object not populated");

    const displayName = postedBy.firstName + ' ' + postedBy.lastName;
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt));
    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    let retweetText = '';
    let replyFlag = '';
    let largeFontClass = largeFont ? "largeFont" : "";

    if (isRetweet) {
        retweetText = `<span><i class="fas fa-retweet"></i> <a href='/profile/${retweetBy}'>${postData.postedBy._id == userLoggedIn._id ? 'You' : '@'+retweetBy} Retweeted</a></span>`;
    }

    if (postData.replyTo && postData.replyTo._id) {
        if (!postData.replyTo._id) {
            return console.log("Reply To is not populated");
        } else if(!postData.replyTo.postedBy._id) {
            return console.log("Posted by is not populated");
        }

        let replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`;
    }

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePict}'/>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a class='displayName' href='/profile/${postedBy.username}'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                        <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button lass='commentButton' data-toggle="modal" data-target="#replyModal">
                                <i class="far fa-comment"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class="fas fa-retweet"></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class="far fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
};

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container) {

    container.html("");
    if (!Array.isArray(results)) {
        results = [results];
    }
    results.forEach(result => {
        let html = createPostHtml(result);
        container.append(html);
    });

    if (results.length === 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
    
}

function outputPostsWithReply(results, container) {

    container.html("");
    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        let html = createPostHtml(results.replyTo);
        container.append(html);
    }
    let mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);
    results.replies.forEach(result => {
        let html = createPostHtml(result);
        container.append(html);
    });

};