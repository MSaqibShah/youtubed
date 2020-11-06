const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ejs = require('ejs');
const app = express();
const bodyParser = require('body-parser');
var archiver = require('archiver');

app.use(express.static(__dirname + '/static'));
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');


app.get("/", (req,res)=> {
  const pageTitle = 'Download Video or Playlist';
  res.render('index',{title: pageTitle});
});

app.post("/", (req,res)=> {
  URL = req.body.url; 

  if (ytdl.validateURL(URL) === true){
    res.redirect('/single');
  }else{
    ytpl.getPlaylistID(URL).then((id)=>{
        res.redirect('/playlist');
    }).catch((err)=>{
      res.redirect('/invalid')
    });
  }
});

app.get("/single", (req,res)=> {

  ytdl.getBasicInfo(URL).then((d)=> {
    details ={
      title: d.videoDetails.title,
      url: URL,
      url_i: d.videoDetails.thumbnail.thumbnails[4].url,
      width_s: d.videoDetails.thumbnail.thumbnails[0].width,
      height_s: d.videoDetails.thumbnail.thumbnails[0].height,
      width_l: d.videoDetails.thumbnail.thumbnails[3].width,
      height_l: d.videoDetails.thumbnail.thumbnails[3].height,
    }
    res.render('single',details);

  }).catch((e)=>{
    console.log("ERROR: "+ e);
  })
});


app.post('/single', (req,res) => {
  url = req.body.url;
  ytdl.getBasicInfo(url).then((d)=> {
      title= d.videoDetails.title;
      title = title.split(' ').join('_');
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      ytdl(url, {format: 'mp4'}).pipe(res);

  }).catch((e)=>{
    console.log("ERROR: "+ e);
  });
});

app.get("/playlist",(req,res)=>{

  ytpl(URL).then((playlist)=>{
    vids = [];
    all_urls =[];
    all_titles =[];
    playlist.items.forEach((item)=>{
      item_data = {
        url: item.url_simple,
        title: item.title,
        url_i: item.thumbnail, 
        duration: item.duration
      }
      all_urls.push(item.url_simple);
      all_titles.push(item.title)
      vids.push(item_data);
    })
    res.render('playlist', {vids,all_urls});
  }).catch((err)=>
   {console.log(err)});
});

app.post("/playlist",(req,res)=>{
  var archive = archiver('zip');
  i = 1;
  vids.forEach((vid)=>{
    let a = ytdl(vid.url, {format: 'mp4'})
    archive.append(a, { name: `0${i}_${vid.title}.mp4` })
    i++;
  });
  archive.finalize();
  archive.pipe(res);
  res.header('Content-Disposition', `attachment; filename="videos.zip"`);
});

app.get("/about",(req,res)=>{
  res.render('about');
})
app.listen(4000, () => {
  console.log('Server Works !!! At port 4000');
});


app.get('/try',(req,res)=> {
  res.render('single', {title:'This is a video title', url: 'https://' ,  width_s: '168',
  height_s: '94', url_i: 'https://i.ytimg.com/vi/_8gHHBlbziw/maxresdefault.jpg' ,  width_l: '336',
  height_l: '188' })
});
