/* create the UI to show environment news for a specified country or city */
function showNewsComponent(data, country) {

    /* local variables */
    let newsArticles = ``;

    /* create articles */
    data.news.forEach((article, i) => {
        if (i < 3) {
            newsArticles += `
                <article class="news__article">
                    <a class="news__article-inside" href="${article.url}" target="_blank">            
                        <div class="news__article-text">
                            <p>${article.title}</p>
                        </div>
                        ${article.image == 'None' ? '' : `<img src="${article.image}" alt="image"></img>`}
                    </a>
                </article>`;
        } else if (i >= 3 && i < 6) {
            newsArticles += `
                <article class="news__article hide">
                    <a class="news__article-inside" href="${article.url}" target="_blank">            
                        <div class="news__article-text">
                            <p>${article.title}</p>
                        </div>
                        ${article.image == 'None' ? '' : `<img src="${article.image}" alt="image"></img>`}
                    </a>
                </article>`;
        }
    });

    /* create HTML content for news section */
    const htmlContent = `
        <h3>Environment articles for ${country}</h3>
        ${newsArticles}
        <button class="news__show-btn" data-show="no">Show More <span>˅</span></button>`;

    /* append HTML content to news section */
    const newsSection = document.querySelector('.news');
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    newsSection.innerHTML = '';
    newsSection.appendChild(div);
    div.classList.add("news__container");

    /* add listener to show more articles button */
    document.querySelector('.news__show-btn').addEventListener('click', function () {

        /* if button closed */
        if (this.getAttribute('data-show') == 'no') {

            /* change style (open) */
            this.setAttribute('data-show', 'yes');
            this.innerHTML = "Show less <span>˄</span>";

            /* show hidden articles */
            document.querySelectorAll('.news__article').forEach(article => article.classList.remove('hide'));

        } else {

            /* change style (close) */
            this.setAttribute('data-show', 'no');
            this.innerHTML = "Show more <span>˅</span>";

            /* hide last articles */
            document.querySelectorAll('.news__article').forEach((article, i) => {
                if (i >= 3 && i < 6) {
                    article.classList.add('hide');
                }
            });
        }
    });
}

export { showNewsComponent };