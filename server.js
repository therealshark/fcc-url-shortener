const Koa = require('koa');
const Router = require('koa-better-router');
const Db = require('./db');


(async () => {
  const router = Router().loadMethods();
  const app = new Koa();
  
  const db = await Db(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_URL}`, "short_url");
  
  router.get("/new/:url(.+)", async ctx => {
    try {
      const id = await db.addUrl(ctx.params.url);
      ctx.body = {
        originalUrl: ctx.params.url,
        shortUrl: process.env.BASE_URL + id
      };
    } catch(err){
      ctx.body = "invalid url";
    }
  });
  
  router.get("/:id", async ctx => {
    const url = await db.getUrl(ctx.params.id);
    if(url){
      ctx.redirect(url);
    }else{
      ctx.body = "invalid id";
    }
  });
  
  router.get("/", async ctx => {
    ctx.body = `
<html>
<head><title>URL Shortener</title></head>
<body>
<h1>URL Shortener</h1>

<h3>Use the following Routes</h3>
<ul>
  <li><code>/new/[url]</code>: Create a new short url for the given <i>url</i>. If the url already has a short version, that one will be returned instead.</li>
  <li><code>/[id]</code>: Redirects to the long url if the id is valid.</li>
</ul>
</body>
</html>
`;
  });
  
  app.use(router.middleware());
  
  app.listen(process.env.PORT);
  
})();