// PageNaviIndex_Bloggerモジュール
var PageNaviIndex_Blogger = PageNaviIndex_Blogger || function() {
    var pg = {  // グローバルスコープに出すオブジェクト。グローバルスコープから呼び出すときはPageNaviIndex_Bloggerになる。
        defaults : {  // 既定値。
            "perPage" : 7, //1ページあたりの投稿数。1ページの容量が1MBを超えないように設定する。最大150まで。
            "numPages" : 5,  // ページナビに表示する通常ページボタンの数。スタートページからエンドページまで。
            "jumpPages" : true
        },
        callback : {  // フィードを受け取るコールバック関数。
            loadFeed : function(json){  // 引数にフィードを受け取る関数。 
            	var posts = [];
            	Array.prototype.push.apply(posts, json.feed.entry);// 投稿のフィードデータを配列に追加。  	
            	var dateouter = ix.createIndex(posts);  // インデックスページの作成。
            	var pagenavi = pn.createPageNavi(json);  // ページナビの作成。
            	g.elem.appendChild(pagenavi);  // ページ内の要素に追加。イベントハンドラはクローンできない。
            	g.elem.appendChild(dateouter);  // ページ内の要素に追加。
            	g.elem.appendChild(pn.clonePageNavi(pagenavi));  // ページ内の要素に追加。
            }
        },
        all: function(elementID) {  // ここから開始する。引数にページナビを置換する要素のidを入れる。
        	ix.init();
        	g.elem = document.getElementById(elementID);  // 要素のidの要素を取得。
        	g.idx = 1;  // start-indexを1にする。
        	if (g.elem) {fd.createURL();}  // 置換する要素が存在するときページを作成する。
        }
    }; // end of pg
    var g = {  // PageNaviIndex_Bloggerモジュール内の"グローバル"変数。
        perPage : pg.defaults.perPage,  // デフォルト値の取得。
        numPages : pg.defaults.numPages,  // デフォルト値の取得。
        elem : null,  // ページナビを挿入するdiv要素。
        idx : null,  // start-index
        jumpPages : pg.defaults.jumpPages  
    }; 
    var pn = {  // ページナビ作成
		clonePageNavi: function(pagenavi) {
			var node = pagenavi.cloneNode(true);
			pn._addEventListerner(node);
			return node;
		},
		createPageNavi: function(json) {  // フィードからページナビのボタンを作成。
			var total = parseInt(json.feed.openSearch$totalResults.$t, 10);  // フィードから総投稿数の取得。
			var currentPageNo = Math.floor((g.idx + g.perPage -1 )/g.perPage);  // start-indexから現在のページ番号を算出。
			var diff =  Math.floor(g.numPages / 2);  // スタートページ - 現在のページ = diff。ジャンプボタンにも使用。
		    var pageStart = currentPageNo - diff;  // スタートページの算出。
		    if (pageStart < 1) {pageStart = 1;}  // スタートページが1より小さい時はスタートページを1にする。
		    var lastPageNo = Math.ceil(total / g.perPage); // 総投稿数から総ページ数を算出。
		    var pageEnd = pageStart + g.numPages - 1;  // エンドページの算出。
		    if (pageEnd > lastPageNo) {pageEnd = lastPageNo;} // エンドページが総ページ数より大きい時はエンドページを総ページ数にする。			
			return pn._createButtons(pageStart, pageEnd, currentPageNo, lastPageNo, diff);
    	},
    	_createButtons: function(pageStart, pageEnd, currentPageNo, lastPageNo, diff) {
    		var arrow = (g.jumpPages)?['\u00ab','\u00bb']:['\u2039','\u203a'];  // スキップのための矢印。
    		var p = nd.divClass(["pagenavi"]);
    		p.setAttribute("style","padding:0px 5px;display:flex;justify-content:center;align-items:center;transform:scaleX(0.9);");
    		if (pageStart > 1) {p.appendChild(pn._createButton(1, 1));}  // スタートページが2以上のときはスタートページより左に1ページ目のボタンを作成する。
		    if (pageStart == 3) {p.appendChild(pn._createButton(2, 2));} // スタートページが3のときはジャンプボタンの代わりに2ページ目のボタンを作成する。
		    if (pageStart > 3) {  // スタートページが4以上のときはジャンプボタンを作成する。
		        var prevNumber =  (g.jumpPages)?pageStart - g.jumpPages + diff:currentPageNo - 1;  // ジャンプボタンでジャンプしたときに表示するページ番号。
		        if (prevNumber < 1) {prevNumber = 1;}
		        p.appendChild(pn._createButton(prevNumber, arrow[0]));  
		    }
		    for (var j = pageStart; j <= pageEnd; j++) {
		    	if (j == currentPageNo) {
		    		var node = nd.createElem("div");
		    		node.setAttribute("style","padding:5px 10px;margin:6px 2px;font-weight:bold;color:#fff;background-color:#000;box-shadow:0px 5px 3px -1px rgba(50, 50, 50, 0.53);"); 
		    		node.appendChild(nd.createTxt(j));
		    		p.appendChild(node);
		    	} else {
		    		p.appendChild(pn._createButton(j, j));
		    	}
	    	}  // スタートボタンからエンドボタンまで作成。
		    if (pageEnd == lastPageNo - 2) {p.appendChild(pn._createButton(lastPageNo - 1, lastPageNo - 1));}  // エンドページと総ページ数の間に1ページしかないときは右ジャンプボタンは作成しない。
		    if (pageEnd < (lastPageNo - 2)) {  // エンドページが総ページ数より3小さい時だけ右ジャンプボタンを作成。
		        var nextnumber = (g.jumpPages)?pageEnd + 1 + diff:currentPageNo + 1;  // ジャンプボタンでジャンプしたときに表示するページ番号。
		        if (nextnumber > lastPageNo) {nextnumber = lastPageNo;} // 表示するページ番号が総ページ数になるときは総ページ数の番号にする。
		        p.appendChild(pn._createButton(nextnumber, arrow[1]));  // 右ジャンプボタンの作成。
		    }
		    if (pageEnd < lastPageNo) {p.appendChild(pn._createButton(lastPageNo, lastPageNo));}  // 総ページ番号ボタンの作成。
		    pn._addEventListerner(p);
    		return p;
    	},
    	_addEventListerner: function(node) {
    		node.addEventListener( 'mousedown', eh.mouseDown, false );  // マウスが要素をクリックしたとき。
         	node.addEventListener( 'mouseover', eh.mouseOver, false );  // マウスポインタが要素に入った時。
         	node.addEventListener( 'mouseout', eh.mouseOut, false );  // マウスポインタが要素から出た時。      		
    	},
    	_createButton: function(pageNo, text) {
    		var node = nd.createElem("div");
    		node.setAttribute("style","padding:5px 10px;margin:6px 2px;color:#fff;background-color:#2973fc;box-shadow:0px 5px 3px -1px rgba(50, 50, 50, 0.53);cursor:pointer");
    		node.title = pageNo;
    		node.className = "pagenavi_button";
    		node.appendChild(nd.createTxt(text));
    		return node;
    	}
	};  // end of pn
    var eh = {  // イベントハンドラオブジェクト。
            _rgbaC: null, // 背景色。styleオブジェクトで取得すると参照渡しになってしまう。
            mouseDown: function(e) {  // 要素をクリックしたときのイベントを受け取る関数。
                var target = e.target;  // イベントを発生したオブジェクト。
                if (target.className == "pagenavi_button") {
                	g.elem.textContent = "";
                	g.idx = parseInt(target.title, 10) * g.perPage - g.perPage + 1;
                	fd.createURL();  // 置換する要素が存在するときページを作成する。
                }
            },
            mouseOver: function(e) {
                var target = e.target;  // イベントを発生したオブジェクト。
                if (target.className == "pagenavi_button") {
                	eh._rgbaC = window.getComputedStyle(e.target, '').backgroundColor;  // 背景色のRGBAを取得。
                	target.style.backgroundColor = "#000";
                	target.style.fontWeight = "bold";
                }
            },
            mouseOut: function(e) {
                var target = e.target;  // イベントを発生したオブジェクト。
                if (target.className == "pagenavi_button") {
                	target.style.backgroundColor = eh._rgbaC; // 背景色を元に戻す。
                	target.style.fontWeight = null;
                }
            }       
        };  // end of eh    
    var ix = {  // インデックスページ作成。
        init: function() {
            	ix._nodes = ix._createNodes();
            },
		_nodes: null,
	    createIndex: function(posts) {  // 投稿のフィードデータからインデックスページを作成する。
	    	var dateouter = nd.divClass(["date-outer"]);  // date-outerクラスのdiv要素を作成。
//	    	var stack = [nd.divClass(["post-outer"]),nd.divClass(["mobile-date-outer","date-outer"])];  // 入れ子にするノードの配列。
//	    	var dateposts = nd.stackNodes(stack);  // date-postsクラスのdiv要素が外側のノードの入れ子を作成。
	    	var dateposts = nd.divClass(["post-outer"]); 
	    	var mobilepostouter = ix._nodes;  // mobile-most-outerクラスのdiv要素の骨格を取得。
	    	posts.forEach(function(e){  // 各投稿のフィードデータについて。
	    		var m = mobilepostouter.cloneNode(true);  // mobile-most-outerクラスのdiv要素の骨格を複製。
	    		m.childNodes[0].href = e.link[4].href;  // 投稿へのURLを投稿タイトルのa要素に追加。
	    		m.childNodes[0].childNodes[0].appendChild(nd.createTxt(e.title.$t));  // h3要素のテキストノードに投稿タイトルを追加。
	    		var labels = (e.category)?e.category:""; // ラベル一覧を取得。
	    		m.childNodes[1].childNodes[0].appendChild(ix._createLabelist(labels));  // post-headerクラスのdiv要素にラベル一覧のノードを追加。
	    		m.childNodes[1].childNodes[1].appendChild(ix._createDate(e.published.$t, "公開"));  // post-headerクラスのdiv要素に公開日時のノードを追加。
	    		m.childNodes[1].childNodes[1].appendChild(ix._createDate(e.updated.$t, "更新"));  // post-headerクラスのdiv要素に更新日時のノードを追加。
	    		m.childNodes[2].href = e.link[4].href;  // 投稿へのURLを投稿サマリのa要素に追加。
	    		m.childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[0].src = (e.media$thumbnail)?e.media$thumbnail.url:"";  // 投稿のサムネイルの表示。
	    		m.childNodes[2].childNodes[1].childNodes[1].appendChild(nd.createTxt(ix._createSummary(e.summary.$t)));   // 投稿サマリーの表示。
	    		var d = dateposts.cloneNode(true);  // date-postsクラスの入れ子の複製を取得。
	    		d.appendChild(m);  // date-postsクラスの入れ子の最後にmobile-most-outerクラスを追加。。
	    		dateouter.appendChild(d);  //  date-outerクラスのdiv要素に追加。
	    	});
	    	return dateouter;
	    },
	    _createNodes: function() {  // mobile-most-outerクラスのdiv要素の骨格を返す関数。
			var m = nd.divClass(["mobile-most-outer"]);  // 親となるmobile-most-outerクラスのdiv要素を作成。
			m.appendChild(nd.stackNodes([nd.createElem("a"),nd.h3Class(["mobile-index-title","entry-title"])]));
			m.childNodes[0].target = "_blank";
			m.appendChild(nd.stackNodes([nd.divClass(["post-header"]),nd.createElem("div")]));
			m.childNodes[1].setAttribute("style","display:flex;justify-content:flex-end;");  // post-headerクラスのstyleを設定。右寄せのflexコンテナにする。
			m.childNodes[1].childNodes[0].setAttribute("style","flex-grow:1;align-self:center;");  // 幅が広がるflexアイテムにする。
			m.childNodes[1].appendChild(nd.createElem("div"));
			m.childNodes[1].childNodes[1].setAttribute("style","font-size:0.9em;flex-shrink:0;");  // 投稿日時のstyleを設定。幅は縮ませない。
			m.appendChild(nd.stackNodes([nd.createElem("a"),nd.divClass(["mobile-index-arrow"]),nd.createTxt("›")]));
			m.childNodes[2].target = "_blank";
			var stack = [nd.divClass(["mobile-index-contents"]),nd.divClass(["mobile-index-thumbnail"]),nd.divClass(["Image"]),nd.imgClass([])];  // 入れ子にするノードの配列。
			m.childNodes[2].appendChild(nd.stackNodes(stack));
			m.childNodes[2].childNodes[1].setAttribute("style","display:flex;align-items:center;");  // mobile-index-contentsクラスのdiv要素をフレックスボックスにする。
			m.childNodes[2].childNodes[1].appendChild(nd.divClass(["post-body"]));
			m.childNodes[2].childNodes[1].appendChild(nd.createElem("div"));
			m.childNodes[2].childNodes[1].childNodes[2].setAttribute("style","clear:both;");  // 上記で追加したdiv要素のsytleを設定。
			return m;
		},
	    _createLabelist: function(labels) {  // 投稿のラベルの配列を引数にラベルのdiv要素を返す関数。
	    	var node = nd.createElem("div");
	    	if (labels) {
	    		node.appendChild(nd.createTxt("ラベル: "));
	    		var a = nd.createElem("a");
	    		var e = labels.pop();
	    		ix._createLabel(node,a,e);
    			e = labels.pop();
	    		while (e) {
	    			node.appendChild(nd.createTxt(", "));
	    			ix._createLabel(node,a,e);
	    			e = labels.pop();
	    		}
	    	}
	    	return node;
	    },
	    _createLabel: function(node,a,e) {
	    	var url = "/search/label/";
	    	var label = a.cloneNode(false);
			label.href = url + e.term;
    		label.appendChild(nd.createTxt(e.term));
			node.appendChild(label);
	    },
	    _createSummary: function(s) {  // サマリーを整形して返す関数。(このブログ特有の処理です）
	    	var reS = /前の関連記事：[\W\w]*/;  // サマリーから除く文字列の正規表現パターン。
	    	var reB = /^前の関連記事：/;  // 以前の記事の整形用の正規表現パターン。
	    	var n = 120;  // サマリーを表示させる制限文字数。
	    	if (reB.test(s)) {  // 先頭に前の関連記事のリンクがあるとき
	    		return s.substring(0,n) + "…";
	    	} else {
	    		s = s.replace(reS,"");
	    		s = (s.length>n)?s.substring(0,n) + "…":s;
	    		return s;
	    	}
	    },
    	_createDate: function(d,txt) {  // 整形日時のdiv要素を返す関数。
    		var reD = /(\d\d\d\d)-(\d\d)-(\d\d).(\d\d):(\d\d):\d\d/;  // 日時を得る正規表現パターン。
    		var arr = reD.exec(d);  // 日時の取得。
    		var node = nd.createElem("div");
//    		node.setAttribute("style","font-size:0.9em;text-align:right;padding-bottom:5px;padding-right:30px");
    		node.appendChild(nd.createTxt(arr[1] + "年" + arr[2] + "月" + arr[3] + "日 " + arr[4] + "時" + arr[5] + "分" + txt));
    		return node;
    	}
    };  // end of ix
    var nd = {  // ノード関連。
		divClass: function(classNames) {  // クラス名の配列を引数としてdiv要素を返す関数。
			return nd._tagClass("div", classNames);
		},
		h3Class: function(classNames) {  // クラス名の配列を引数としてh3要素を返す関数。
			return nd._tagClass("h3", classNames);
		},
		imgClass: function(classNames) {  // クラス名の配列を引数としてimg要素を返す関数。
			return nd._tagClass("img", classNames);
		},
		_tagClass: function(tag,classNames) {  // 生成するtag名、クラス名の配列を引数として要素を返す関数。
			var node = nd.createElem(tag);  // tag要素を作成。
			if (classNames.length){
				classNames.forEach(function(e) {
					node.classList.add(e);  // クラスを追加。
				});
			}
			return node;				
		},
		createElem: function(tag) {  // tagの要素を作成して返す関数。
			return document.createElement(tag); 
		},
		createTxt: function(txt) {  // テキストノードを返す関数。
			return document.createTextNode(txt);
		},
		stackNodes: function(stack) {  // ノードの配列を引数として入れ子のノードを返す関数。
			var p;
	    	var c = stack.pop();
	    	while (stack.length) {  // 配列の要素の有無でfalseは判断できないので配列の長さで判断する。
	    		p = stack.pop();
	    		p.appendChild(c);
	    		c = p;
	    	}
	    	return p||c;
		},
		appendChild: function(parent,child) {
			var c = parent.childs[0];
			while (c) {
				var d = c.childs[0];
				if (!d) {
					c.appendChild(child);
				} 
				c = d;
			}
		}
    };  // end of nd
    var fd = {  // フィード関連。
		createURL: function () {  // URLから情報を得てフィードを取得するURLを作成。引数はstart-index。
	    	var reL = /\/search\/label\/(.+)/;  // ラベル収得のための正規表現パターン。
	    	var reQ = /\?q=(.+)/;  // 検索語収得のための正規表現パターン。
	    	var reM = /(\d\d\d\d)_(\d\d)_\d\d_archive.html/;  // 月のアーカイブページから年月を得るための正規表現パターン。
	    	var reY = /\/search\?(updated-min=\d\d\d\d-01-01T00:00:00%2B09:00&updated-max=\d\d\d\d-01-01T00:00:00%2B09:00)/;  // 年のアーカイブページから期間を得るための正規表現パターン。
	    	var url = "?"; // フィードを得るURLを初期化。
	    	var url2 = "";  // アーカイブページ用の追加URLを初期化。
	    	var thisUrl = location.href;  // 現在表示しているURLを収得。
	    	thisUrl = thisUrl.replace(/\?m=[01][&\?]/,"?").replace(/[&\?]m=[01]/,"");  // ウェブバージョンとモバイルサイトのパラメータを削除。
	    	if (reQ.test(thisUrl)) {  // 検索結果ページのとき
	        	var q = reQ.exec(thisUrl)[1];  // 検索文字列を収得
	        	url = "/?q=" + q + "&";
	    	} else if (reL.test(thisUrl)) {  // ラベルインデックスページの時。
	            var postLabel = reL.exec(thisUrl)[1];  // ラベル名を取得。後読みは未実装の可能性あるので使わない。
	            url = "/-/" + postLabel + url;       
	        } else if (reM.test(thisUrl)) {  // 月のアーカイブページの時。モバイルの時は後ろに?m=1がつく。
	        	var arr = reM.exec(thisUrl);  // URLから年月を取得。
	        	var em = new Date(arr[1], arr[2], 0).getDate();  // 月の末日を取得。28から31のいずれかしか返ってこないはず。
	        	url2 = "&published-min=" + arr[1] + "-" + arr[2] + "-01T00:00:00%2B09:00&published-max=" + arr[1] + "-" + arr[2] + "-" + em  + "T23:59:99%2B09:00";  
	        } else if (reY.test(thisUrl)) {  // 年のアーカイブページの時。
	        	url2 = reY.exec(thisUrl)[1].replace(/updated-/g,"published-");  // URLから期間を取得。
	        	url2 = "&" + url2;       
	        } 
	    	url = "/feeds/posts/summary" + url + "alt=json-in-script&callback=PageNaviIndex_Blogger.callback.loadFeed&max-results=" + g.perPage + "&start-index=" + g.idx + url2;    
	    	fd._writeScript(url);
	    },   
	    _writeScript: function (url) {  // スクリプト注入。
	        var ws = nd.createElem('script');
	        ws.type = 'text/javascript';
	        ws.src = url;
	        document.getElementsByTagName('head')[0].appendChild(ws);
	    }        			
    }; // end of fd
    return pg;  // グローバルスコープにだす。
}();
//デフォルト値を変更したいときは以下のコメントアウトをはずして設定する。
//PageNaviIndex_Blogger.defaults["perPage"] = 7 //1ページあたりの投稿数。
//PageNaviIndex_Blogger.defaults["numPages"] = 5 // ページナビに表示するページ数。
//PageNaviIndex_Blogger.defaults["jumpPages"] = true // ページナビに表示するページ数。
PageNaviIndex_Blogger.all("pagenaviindex");  // ページナビの起動。引き数にHTMLの要素のid。