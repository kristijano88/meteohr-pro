
let map=L.map('map').setView([45.8,16],7);
L.tileLayer(
'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
{
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}
).addTo(map);
let marker,t,w;
function icon(c){if(c===0)return'☀️';if([1,2,3].includes(c))return'⛅';if([95,96,99].includes(c))return'⛈️';if([51,53,55,61,63,65,80,81,82].includes(c))return'🌧️';return'☁️';}
function myLocation(){navigator.geolocation.getCurrentPosition(p=>loadCoords(p.coords.latitude,p.coords.longitude));}
async function loadWeather(){const p=document.getElementById('place').value;const g=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(p)+'&count=1');const j=await g.json();if(j.results)loadCoords(j.results[0].latitude,j.results[0].longitude,j.results[0].name);}
async function loadCoords(lat,lon,name='Moja lokacija'){
if(marker)map.removeLayer(marker);marker=L.marker([lat,lon]).addTo(map);map.setView([lat,lon],10);
const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`);
const d=await r.json();
const rain=Math.max(...d.hourly.precipitation_probability.slice(0,24));
const gust=Math.max(...d.hourly.wind_gusts_10m.slice(0,24));
const hail=Math.min(100,Math.round(rain*0.6+Math.max(0,gust-30)));
const storm=Math.min(100,Math.round(rain*0.7+Math.max(0,gust-20)));
const cape=Math.round(storm*20);
summary.innerHTML=`<div class='card'><h2>${name}</h2>🌡️ ${d.current.temperature_2m}°C | 💨 ${d.current.wind_speed_10m} km/h<br>⚡ CAPE procjena: ${cape} J/kg<br>🧊 Tuča: ${hail}% | 🚨 Nevrijeme: ${storm}%</div>`;
alerts.innerHTML=`<div class='card'>Upozorenje: ${storm>70?'🔴 Visok rizik':'🟢 Nizak do umjeren rizik'}</div>`;
if(t)t.destroy(); if(w)w.destroy();
t=new Chart(tempChart,{type:'line',data:{labels:d.hourly.time.slice(0,48),datasets:[{label:'Temperatura',data:d.hourly.temperature_2m.slice(0,48)}]}});
w=new Chart(windChart,{type:'line',data:{labels:d.hourly.time.slice(0,48),datasets:[{label:'Udari vjetra',data:d.hourly.wind_gusts_10m.slice(0,48)}]}});
let h="<div class='card'><h3>⏰ 24 sata</h3><table>";
for(let i=0;i<24;i++){
  let rain=d.hourly.precipitation_probability[i];
  let ico="☀️";

  if(rain>=20) ico="⛅";
  if(rain>=50) ico="🌧️";
  if(rain>=80) ico="⛈️";

  h+=`
  <tr>
    <td>${ico}</td>
    <td>${d.hourly.time[i].slice(11,16)}</td>
    <td>${d.hourly.temperature_2m[i]}°C</td>
    <td>${rain}%</td>
  </tr>`;
};
hourly.innerHTML=h+"</table></div>";
let f="<div class='card'><h3>📅 7 dana</h3><table>";
for(let i=0;i<7;i++)f+=`<tr><td>${icon(d.daily.weather_code[i])}</td><td>${d.daily.time[i]}</td><td>${d.daily.temperature_2m_min[i]}°/${d.daily.temperature_2m_max[i]}°</td><td>${d.daily.precipitation_probability_max[i]}%</td></tr>`;
forecast.innerHTML=f+"</table></div>";
}
