# Page Navigation Gadget for [Blogger.com](https://www.blogger.com/about/?r=1-null_user)

This gadget uses feeds, so it will not work with private blogs.

This rewrites index pages and archive pages by replacing "include" of Blog1 widget with HTML editing of the theme.

This repository contains the Eclipse project.

Eclipse Java EE IDE for Web Developers.　Version: Mars.2 Release (4.5.2)

## Parameters
```
PageNaviIndex_Blogger.defaults["perPage"] = 7; // Number of posts per page.
PageNaviIndex_Blogger.defaults["numPages"] = 5; // Number of pages to display in page navigation.
PageNaviIndex_Blogger.defaults["jumpPages"] = true; // Jump button setting. Total page numbers are exchanged in true, false moves one page at a time.
PageNaviIndex_Blogger.defaults["scrollTo"] = "uppermost";   // The page navigation button scrolls after moving. If it does not set, it jumps to the id element of the argument of PageNaviIndex_Blogger.all().
```
Since "uppermost" is a div element of id which exists only in this blog, comment it out as appropriate.

```
// Style of page navigation buttons.	
PageNaviIndex_Blogger.defaults["buttonStyle"] =  "padding:5px 10px;margin:6px 2px;color:#fff;background-color:#2973fc;box-shadow:0px 5px 3px -1px rgba(50, 50, 50, 0.53);cursor:pointer"; 
// Style of the current page number.
 PageNaviIndex_Blogger.defaults["currentButtonStyle"] = "padding:5px 10px;margin:6px 2px;font-weight:bold;color:#fff;background-color:#000;box-shadow:0px 5px 3px -1px rgba(50, 50, 50, 0.53);"; 
PageNaviIndex_Blogger.defaults["mouseOverColor"] = "grey"; // The color when the mouse is placed on the page number.
```

## How to Deploy

In the layout screen, paste and save the code of PageNaviIndex_Blogger.js or PageNaviIndex_Blogger.min.js in the HTML / JavaScript gadget.

This gadget must be loaded after the Blog1 gadget.

When using this gadget in the mobile version, set the attribute of HTML widget with HTML/JavaScript gadget to `mobile = 'yes'`.

Open the HTML editing page of the theme.

Move to the Blog1 widget.

Click <b: if cond = '! Data: mobile'> line number in the main include of the Blog 1 widget and collapse it, then insert `<style>/*` and `*/</ style>` above and below it to comment it out.

Insert the following code instead.

```
<b:if cond='!data:mobile'> <!-- When in web version -->
  <div class='blog-posts hfeed'>
    <b:include data='top' name='status-message'/>
    <b:if cond='(data:blog.pageType == &quot;index&quot;) or (data:blog.searchLabel;) or (data:blog.pageType == &quot;archive&quot;)'> <!-- For index page, label index pages, archive pages -->
       <div class='blog-pager' id='pagenaviindex'/><!-- This div element will be replaced by the gadget. -->
    <b:else/> <!-- On other pages -->
      <b:loop values='data:posts' var='post'>
        <div class='post-outer'>
          <b:include data='post' name='post'/>
          <b:include data='post' name='comment_picker'/>  <!-- Blog comment -->
        </div>
        <b:include name='nextprev'/>
      </b:loop>
     </b:if>
  </div>
<b:else/> <!-- When in mobile version -->
  <b:include name='mobile-main'/>
</b:if>
```

When replacing mobile version index pages, rewrite the mobile-main include of the Blog1 widget as follows.


```
<b:includable id='mobile-main' var='top'>
  <!-- posts -->
  <div class='blog-posts hfeed'>
    <b:include data='top' name='status-message'/>
    <b:if cond='(data:blog.pageType == &quot;index&quot;) or (data:blog.searchLabel;) or (data:blog.pageType == &quot;archive&quot;)'> <!-- For index page, label index pages, archive pages -->
       <div class='blog-pager' id='pagenaviindex'/><!-- This div element will be replaced by the gadget. -->
    <b:else/>
      <b:loop values='data:posts' var='post'>
        <b:include data='post' name='mobile-post'/>
      </b:loop>
       <b:include name='mobile-nextprev'/>
    </b:if>
  </div>
  <!--  <b:include name='mobile-nextprev'/> -->
</b:includable>
```
## Working Example

You can see a working example on [p--q](https://p--q.blogspot.jp/)'s site.
