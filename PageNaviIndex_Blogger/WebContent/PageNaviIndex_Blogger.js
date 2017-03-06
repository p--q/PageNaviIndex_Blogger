// PageNaviIndex_Bloggerモジュール
var PageNaviIndex_Blogger = PageNaviIndex_Blogger || function() {
    var pg = {  // グローバルスコープに出すオブジェクト。グローバルスコープから呼び出すときはPageNaviIndex_Bloggerになる。
        defaults : {  // 既定値。
            "perPage" : 7, //1ページあたりの投稿数。1ページの容量が1MBを超えないように設定する。最大150まで。
            "numPages" : 5,  // ページナビに表示する通常ページボタンの数。スタートページからエンドページまで。
            "jumpPages" : true  // trueのときはページ番号をすべて入れ替える、falseのときは1つずつ表示ページがずれる。
        },
        callback : {  // フィードを受け取るコールバック関数。
            loadFeed : function(json) {  // 引数にフィードを受け取る関数。 
            	var total = parseInt(json.feed.openSearch$totalResults.$t, 10);  // フィードから総投稿数の取得。
            	var posts = [];  // 投稿のフィードデータをいれる配列。
            	Array.prototype.push.apply(posts, json.feed.entry);// 投稿のフィードデータを配列に追加。  	
            	if (g.status&&g.postLabel) {g.status[0].textContent = "ラベル「" + decodeURIComponent(g.postLabel) + "」に一致する投稿が" + total + "個ありました。";}
            	g.createPage(total,posts);
            },
	        loadFeedforQ : function(json) {
	        	Array.prototype.push.apply(g.posts, json.feed.entry);// 投稿のフィードデータを配列に追加。
	        	var totalResults = parseInt(json.feed.openSearch$totalResults.$t, 10);
	        	var itemsPerPage = parseInt(json.feed.openSearch$itemsPerPage.$t, 10);
	        	if (totalResults>itemsPerPage) {  // totalResultsの方が大きい時はまだ検索結果があるということ。
	        		g.startIndex += g.maxResults;  // 残りの投稿の開始番号。
	        		url = "/feeds/posts/summary/?q=" + g.q + "&alt=json-in-script&callback=PageNaviIndex_Blogger.callback.loadFeedforQ&max-results=" + g.maxResults + "&start-index=" + g.startIndex; 
			    	fd._writeScript(url);
	        	} else {  // すべての検索結果のフィードが取得できたとき
	        		if (g.status) {g.status[0].textContent = "検索キーワード「" + decodeURIComponent(g.q) + "」に一致する投稿が" + g.posts.length + "個ありました。";}
	        		g.createPage(g.posts.length,g.posts.slice(g.idx-1,g.idx-1+g.perPage));	
	        	}
	        }
        },
        all: function(elementID) {  // ここから開始する。引数にページナビを置換する要素のidを入れる。
        	ix.init();  // ページの切替ごとに計算不要なものを計算しておく。
        	g.elem = document.getElementById(elementID);  // 要素のidの要素を取得。
        	g.idx = 1;  // start-indexを1にする。
        	g.status = document.getElementsByClassName("status-msg-body");
        	if (g.elem) {fd.createURL();}  // 置換する要素が存在するときページを作成する。
        }
    }; // end of pg
    var g = {  // PageNaviIndex_Bloggerモジュール内の"グローバル"変数。
        perPage : pg.defaults.perPage,  // デフォルト値の取得。 1ページあたりの投稿数。
        numPages : pg.defaults.numPages,  // デフォルト値の取得。ページナビに表示する通常ページボタンの数。
        elem : null,  // ページナビを挿入するdiv要素。 -->
        idx : null,  // start-index
        jumpPages : pg.defaults.jumpPages,  // ジャンプボタンの挙動設定。  
        w: true,  // モバイルサイトのときはfalseになる。
        q: null,  // 検索語
        posts: [],  // 検索結果のフィードからの投稿データを入れる配列。
        startIndex: 1,  // 検索結果用
        maxResults: 150,  //  検索結果用。フィードで取得可能な最大投稿数。
        createPage: function(total,posts) {
    		var pagenavi = pn.createPageNavi(total);  // ページナビのノードの取得。
    		var dateouter = ix.createIndex(posts);  // インデックスページのノードを取得。
    		g.elem.textContent = "";  // すでにある要素を削除。
        	g.elem.appendChild(pagenavi);  // ページ内の要素にページナビを追加。
        	g.elem.appendChild(dateouter);  // ページ内の要素にインデックスページを追加。
        	g.elem.appendChild(pn.clonePageNavi(pagenavi));  // ページ内の要素にページナビを複製して追加。
        },
        status: null,  // 結果のステーテス要素。
        postLabel: null  // ラベル名。
    }; 
    var pn = {  // ページナビ作成
		clonePageNavi: function(pagenavi) {  // ページナビのノードを複製してイベントハンドラを追加する。
			var node = pagenavi.cloneNode(true);
			pn._addEventListerner(node);  // イベントハンドラの追加。
			return node;
		},
		createPageNavi: function(total) {  // フィードの総投稿数からページナビのボタンを作成に必要な計算をする。 -->
			var currentPageNo = Math.floor((g.idx + g.perPage -1 )/g.perPage);  // start-indexから現在のページ番号を算出。
			var diff =  Math.floor(g.numPages / 2);  // スタートページ - 現在のページ = diff。ジャンプボタンにも使用。
		    var pageStart = currentPageNo - diff;  // スタートページの算出。
		    if (pageStart < 1) {pageStart = 1;}  // スタートページが1より小さい時はスタートページを1にする。
		    var lastPageNo = Math.ceil(total / g.perPage); // 総投稿数から総ページ数を算出。
		    var pageEnd = pageStart + g.numPages - 1;  // エンドページの算出。
		    if (pageEnd > lastPageNo) {pageEnd = lastPageNo;} // エンドページが総ページ数より大きい時はエンドページを総ページ数にする。			
			return pn._createButtons(pageStart, pageEnd, currentPageNo, lastPageNo, diff);
    	},
    	_createButtons: function(pageStart, pageEnd, currentPageNo, lastPageNo, diff) {  // ページナビのボタンの作成。引数は、表示するページナビボタンの先頭のページ番号、最後のページ番号、現在のページ番号、最終ページ番号、g.jumpPagesがtrueのとき使用する変数。
    		var arrow = (g.jumpPages)?['\u00ab','\u00bb']:['\u2039','\u203a'];  // スキップのための矢印。
    		var p = nd.divClass(["pagenavi"]);  // ページナビボタンのノードを作成。
    		p.setAttribute("style","padding:0px 5px;display:flex;justify-content:center;align-items:center;transform:scaleX(0.9);");
    		if (pageStart > 1) {p.appendChild(pn._createButton(1, 1));}  // スタートページが2以上のときはスタートページより左に1ページ目のボタンを作成する。
		    if (pageStart == 3) {p.appendChild(pn._createButton(2, 2));} // スタートページが3のときはジャンプボタンの代わりに2ページ目のボタンを作成する。
		    if (pageStart > 3) {  // スタートページが4以上のときはジャンプボタンを作成する。
		        var prevNumber =  (g.jumpPages)?pageStart - g.jumpPages + diff:currentPageNo - 1;  // ジャンプボタンでジャンプしたときに表示するページ番号。
		        if (prevNumber < 1) {prevNumber = 1;}  // 1より小さい時は1にする。
		        p.appendChild(pn._createButton(prevNumber, arrow[0]));  // 左へのジャンプボタンの作成。
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
                	g.idx = parseInt(target.title, 10) * g.perPage - g.perPage + 1;
                	fd.createURL();  // 置換する要素が存在するときページを作成する。
                }
            },
            mouseOver: function(e) {  // マウスポインタが要素に入った時。
                var target = e.target;  // イベントを発生したオブジェクト。
                if (target.className == "pagenavi_button") {
                	eh._rgbaC = window.getComputedStyle(e.target, '').backgroundColor;  // 背景色のRGBAを取得。
                	target.style.backgroundColor = "grey";
                	target.style.fontWeight = "bold";
                }
            },
            mouseOut: function(e) {  // マウスポインタが要素から出た時。     
                var target = e.target;  // イベントを発生したオブジェクト。
                if (target.className == "pagenavi_button") {
                	target.style.backgroundColor = eh._rgbaC; // 背景色を元に戻す。
                	target.style.fontWeight = null;
                }
            }       
        };  // end of eh    
    var ix = {  // インデックスページ作成。
        init: function() {
            	ix._nodes = ix._createNodes();  // 再描画で計算不要なものは計算しておく。
            },
		_nodes: null,
	    createIndex: function(posts) {  // 投稿のフィードデータからインデックスページを作成する。
	    	var dateouter = nd.divClass(["date-outer"]);
	    	var divposts = ix._nodes;  // 投稿をまとめるdiv要素の骨格を取得。
	    	divposts.className = (g.w)?"post-outer":"mobile-date-outer date-outer";
	    	if (!g.w) {divposts.style.backgroundImage = "url(https://resources.blogblog.com/blogblog/data/1kt/transparent/white80.png)";}  // モバイルサイトではテンプレートの背景画像を設定する。
	    	posts.forEach(function(e){  // 各投稿のフィードデータについて。
	    		var m = divposts.cloneNode(true);  // mobile-post-outerクラスのdiv要素の骨格を複製。
	    		m.childNodes[0].href = e.link[4].href;  // 投稿へのURLを投稿タイトルのa要素に追加。
	    		m.childNodes[0].childNodes[0].appendChild(nd.createTxt(e.title.$t));  // h3要素のテキストノードに投稿タイトルを追加。
	    		m.childNodes[1].href = e.link[4].href;  // 投稿へのURLを投稿サマリのa要素に追加。
	    		if (e.media$thumbnail) {m.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src = e.media$thumbnail.url;}// サムネイル画像があれば追加。
	    		m.childNodes[1].childNodes[0].childNodes[1].appendChild(nd.createTxt(ix._createSummary(e.summary.$t)));   // 投稿サマリーの表示。
	    		m.childNodes[2].childNodes[0].appendChild(ix._createLabelist(e.category));  // post-headerクラスのdiv要素にラベル一覧のノードを追加。
	    		m.childNodes[2].childNodes[1].appendChild(ix._createDate(e.published.$t, "公開"));  // post-headerクラスのdiv要素に公開日時のノードを追加。
	    		m.childNodes[2].childNodes[1].appendChild(ix._createDate(e.updated.$t, "更新"));  // post-headerクラスのdiv要素に更新日時のノードを追加。
	    		if (!e.media$thumbnail) {m.childNodes[1].childNodes[0].removeChild(m.childNodes[1].childNodes[0].childNodes[0]);}  // サムネイル画像がないときmobile-index-thumbnailクラスのノードを削除。先に削るとずれるので最後に削る。
    			dateouter.appendChild(m);  //  date-outerクラスのdiv要素に追加。
	    	});
	    	return dateouter;
	    },
	    _createNodes: function() {  // 投稿サマリをまとめるdiv要素の骨格を返す関数。g.wを設定する前なのでg.wは使えない。
	    	var m = nd.createElem("div");  // 投稿サマリをまとめるdiv要素。
			m.appendChild(nd.stackNodes([nd.createElem("a"),nd.h3Class(["mobile-index-title","entry-title"])]));
			m.childNodes[0].childNodes[0].setAttribute("style","margin-bottom:5px;");  // 投稿タイトルのスタイルの設定。
			m.childNodes[0].target = "_blank";  // 投稿タイトルのアンカータグの設定。
			m.appendChild(nd.createElem("a"));
			m.childNodes[1].target = "_blank";  // 投稿サマリのアンカータグの設定。
			var stack = [nd.divClass(["mobile-index-contents"]),nd.divClass(["mobile-index-thumbnail"]),nd.divClass(["Image"]),nd.imgClass([])];  // 入れ子にするノードの配列。
			m.childNodes[1].appendChild(nd.stackNodes(stack));
			m.childNodes[1].childNodes[0].setAttribute("style","display:flex;align-items:center;");  // mobile-index-contentsクラスのdiv要素をフレックスコンテナにする。投稿サムネイルと投稿サマリーがフレックスアイテムになる。
			m.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].setAttribute("style","margin-right:5px;");  // 投稿のサムネイルのスタイルの設定。
			m.childNodes[1].childNodes[0].appendChild(nd.divClass(["post-body"]));  // 投稿サマリーのフレックスアイテム。
			m.childNodes[1].childNodes[0].childNodes[1].setAttribute("style","word-break:break-all;");  // 投稿サマリーがはみ出ないようにする設定。
			m.appendChild(nd.stackNodes([nd.divClass(["post-header"]),nd.createElem("div")]));
			m.childNodes[2].setAttribute("style","display:flex;justify-content:flex-end;margin:0;");  // post-headerクラスのstyleを設定。右寄せのflexコンテナにする。
			m.childNodes[2].childNodes[0].setAttribute("style","flex-grow:1;align-self:center;");  // 幅が広がるflexアイテムにする。
			m.childNodes[2].appendChild(nd.createElem("div"));  // 投稿日時を入れるフレックスアイテム。
			m.childNodes[2].childNodes[1].setAttribute("style","font-size:0.9em;flex-shrink:0;");  // 投稿日時
			return m;
		},
	    _createLabelist: function(labels) {  // 投稿のラベルの配列を引数にラベルのdiv要素を返す関数。ラベルがないときは空のdiv要素を返す。
	    	var node = nd.createElem("div");
	    	if (labels&&g.w) {  // 配列の判定は長さでやる必要があるが、ラベルがないときはundefinedになるのでこのまま使える。モバイルサイトでもラベル表示はしない。
	    		if (labels.length) {  // 何故か配列要素0個のときがあるので除外。
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
		appendChild: function(parent,child) {  // parentの最後のノードにchildを追加する。
			var c = parent.firstChild;  // parent.childs[0]にすると構文エラーになる。
			if (!c) {parent.appendChild(child);} 
			while (c) {
				var d = c.firstChild;
				if (!d) {c.appendChild(child);} 
				c = d;
			}
		}
    };  // end of nd
    var fd = {  // フィード関連。
		createURL: function () {  // URLから情報を得てフィードを取得するURLを作成。引数はstart-index。
			g.q = null;  // 検索語をリセット。
	    	var reL = /\/search\/label\/(.+)/;  // ラベル収得のための正規表現パターン。
	    	var reQ = /\?q=(.+)/;  // 検索語収得のための正規表現パターン。
	    	var reM = /(\d\d\d\d)_(\d\d)_\d\d_archive.html/;  // 月のアーカイブページから年月を得るための正規表現パターン。
	    	var reY = /\/search\?(updated-min=\d\d\d\d-01-01T00:00:00%2B09:00&updated-max=\d\d\d\d-01-01T00:00:00%2B09:00)/;  // 年のアーカイブページから期間を得るための正規表現パターン。
	    	var url = "?"; // フィードを得るURLを初期化。
	    	var url2 = "";  // アーカイブページ用の追加URLを初期化。
	    	var thisUrl = location.href;  // 現在表示しているURLを収得。
	    	g.w = (/m=1/.test(thisUrl))?false:true;  // モバイルサイトの判別。
	    	thisUrl = thisUrl.replace(/\?m=[01][&\?]/,"?").replace(/[&\?]m=[01]/,"");  // ウェブバージョンとモバイルサイトのパラメータを削除。
	    	if (reQ.test(thisUrl)) {  // 検索結果ページのとき。取得できる投稿総数が一回で取得できないので処理を変える。
	    		if (g.posts.length) {  // すでに検索語を取得している時。g.qは保存されないので判定に使えない。
	    			g.createPage(g.posts.length,g.posts.slice(g.idx-1,g.idx-1+g.perPage));	
	    		} else {
	    			g.q = reQ.exec(thisUrl)[1];  // 検索文字列を収得       		
		        	url = "/feeds/posts/summary/?q=" + g.q + "&alt=json-in-script&callback=PageNaviIndex_Blogger.callback.loadFeedforQ&max-results=" + g.maxResults + "&start-index=1";  //最大投稿数のフィードを取得。    
		        	if (g.status) {g.status[0].textContent = "検索キーワード「" + decodeURIComponent(g.q) + "」に一致する投稿を検索しています。";}
		        	fd._writeScript(url);
	    		}
	    	} else {
	    		if (reL.test(thisUrl)) {  // ラベルインデックスページの時。
		            g.postLabel = reL.exec(thisUrl)[1];  // ラベル名を取得。後読みは未実装の可能性あるので使わない。
		            url = "/-/" + g.postLabel + url;       
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
			}
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