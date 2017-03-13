#Page Navigation Gadget for [Blogger.com](https://www.blogger.com/about/?r=1-null_user)

This gadget uses feeds, so it will not work with private blogs.

This rewrites index pages and archive pages by replacing "include" of Blog1 widget with HTML editing of the theme.

##How to Deploy

In the layout screen, paste and save the code of PageNaviIndex_Blogger.js or PageNaviIndex_Blogger.min.js in the HTML / JavaScript gadget.

When using this gadget in the mobile version, set the attribute of HTML widget with HTML/JavaScript gadget to mobile = 'yes'.

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
