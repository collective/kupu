============
Kupu drawers
============

Where have the drawers gone?
----------------------------

Those of you that have tested the 1.1 alpha or beta releases of Kupu may
wonder where the drawers are. The drawers are small tools that can be opened
by pressing buttons on the toolbar and expose some functionality such as
entering links or browsing for images. Part of the drawers is static and part
of them get XML from the server and transform that into HTML on the client
using XSLT.

The drawers are finally quite stable, there were some problems in the past but
nowadays they work quite well. However, there are still some problems,
rendering isn't perfect (especially on IE there are some CSS issues) and they
don't work nicely stand-alone. For these reasons we decided to move them to
the 'experimental' html file, common/kupu_experimental.html.

If you want to use the drawers in your own setup (do mind that you need to
provide some XML from the server if you do) use the kupu_experimental.html
file as an example implementation. If you're just curious, try the file out.
Note that in that case they will not fully function: as said that requires
some server-side support, which isn't available in the filesystem setup
(obviously).

We hope to have the drawers working from the filesystem and also that we get
to squish the CSS bugs so we can have the drawers in the main distribution (in
the kupu.html file) in the next release.
