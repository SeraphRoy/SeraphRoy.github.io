'use strict';

var SimpleBlogSearch = function(args) {
   'use strict';
   $.ajax({
      url: args.searchDataPath,
      dataType: args.dataType,
      success: function( response ) {
         // get the contents from search data
         var datas = args.processDataFunc(response);
         var $input = document.getElementById(args.searchInputID);
         if (!$input) return;
         var $resultContent = document.getElementById(args.resultsDivID);
         if ($("#" + args.searchInputID).length > 0) {
            $input.addEventListener('input', function () {
               var str = `<ul class="${args.resultULClass}">`;
               var keywordRegex = new RegExp(this.value.toLowerCase(), "g")
               $resultContent.innerHTML = "";
               if (this.value.trim().length <= 0) {
                  return;
               }
               // perform local searching
               var count = 0
               datas.some(function (data) {
                  var isMatch = false;
                  var content_index = [];
                  if (!data.title || data.title.trim() === '') {
                     data.title = "Untitled";
                  }
                  var data_title = data.title.trim().toLowerCase();
                  var data_content = data.content.trim().replace(/(\r\n\t|\n|\r\t|\s)+/gm, " ")
                  var data_content_lowercase = data_content.toLowerCase()
                  var data_url = data.url;
                  var index_content = -1;
                  var first_occur = -1;
                  // only match artiles with not empty contents
                  if (data_content_lowercase !== '') {
                     var matchTitles = data_title.match(keywordRegex)
                     var matchContents = data_content_lowercase.match(keywordRegex)
                     if (matchTitles != null) {
                        isMatch = true
                     }
                     if (matchContents != null) {
                        isMatch = true
                        index_content = data_content_lowercase.indexOf(matchContents[0]);
                     }
                     if (index_content < 0) {
                        index_content = 0
                     }
                     first_occur = index_content
                  }

                  // show search results
                  if (isMatch) {
                     str += `<li><a href='${data_url}'>${data.title}</a>`;
                     var content = data.content.trim();
                     if (first_occur >= 0) {
                        // cut out 100 characters
                        var start = first_occur - 20;
                        var end = first_occur + 80;

                        if (start < 0) {
                           start = 0;
                        }

                        if (start == 0) {
                           end = 100;
                        }

                        if (end > data_content.length) {
                           end = data_content.length;
                        }
                        var match_content = data_content.substring(start, end);


                        // highlight search result
                        if (matchContents != null) {
                           var regStr;
                           if (match_content.toLowerCase().includes(matchContents[0])) {
                              regStr = matchContents[0]
                           } else {
                              regStr = match_content.substring(20)
                           }
                           var reg = new RegExp(regStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
                           match_content = match_content.replace(reg,
                              `<em class="${args.highlightKeywordClass}">${regStr}</em>`);
                        }

                        str += `<p class="${args.resultParagraphClass}">${match_content}...</p>`
                     }
                     str += "</li>";
                     count += 1;
                  }
                  return count == args.limit;
               });
               str += "</ul>";
               $resultContent.innerHTML = str;
            });
         }
      }
   });
}

module.exports = SimpleBlogSearch;
