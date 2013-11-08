Conditional fields for the Help Center
==============================

Conditional fields for the Help Center

Requires: 
*  [underscorejs](http://underscorejs.org/)

The code is to be copy and pasted into the global javascript section of the Help Center, replacing the settings var with your JSON string. If you have created a JSON object for the [condition fields app](https://github.com/zendesklabs/conditional_fields_app) you can use the same object here. 

To add underscorejs to your Help Center to the site, download the min verison. Upload that version to the assest section. This will give you a url to that asset, add a script tag to the document head for example:

```
<script type="text/javascript" src="/hc/theme_assets/41061/613/underscore-min.js"></script>
```
