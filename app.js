
let map=L.map('map').setView([45.8,16],7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker;
async function loadWeather(){
const place=document.getElementById('place').value;
const g=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(place)+'&count=1');
const gj=await g.json(); if(!gj.results)return;
const r=gj.results[0];
if(marker) map.removeLayer(marker);
marker=L.marker([r.latitude,r.longitude]).addTo(map);
map.setView([r.latitude,r.longitude],10);
const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${r.latitude}&longitude=${r.longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`);
const d=await w.json();
const rain=Math.max(...d.hourly.precipitation_probability.slice(0,24));
const gust=Math.max(...d.hourly.wind_gusts_10m.slice(0,24));
const hail=Math.min(100,Math.round(rain*0.5+Math.max(0,gust-30)*0.5));
const storm=Math.min(100,Math.round(rain*0.7+Math.max(0,gust-20)*0.6));
document.getElementById('summary').innerHTML=`<h2>${r.name}</h2><p>🌡️ ${d.current.temperature_2m}°C | 💨 ${d.current.wind_speed_10m} km/h | ⛈️ Tuča ${hail}% | 🚨 Nevrijeme ${storm}%</p>`;
new Chart(document.getElementById('tempChart'),{type:'line',data:{labels:d.hourly.time.slice(0,24),datasets:[{label:'Temp',data:d.hourly.temperature_2m.slice(0,24)}]}});
new Chart(document.getElementById('rainChart'),{type:'bar',data:{labels:d.hourly.time.slice(0,24),datasets:[{label:'Kiša %',data:d.hourly.precipitation_probability.slice(0,24)}]}});
let html='<h3>7 dana</h3><table>';
for(let i=0;i<7;i++) html+=`<tr><td>${d.daily.time[i]}</td><td>${d.daily.temperature_2m_min[i]}°C</td><td>${d.daily.temperature_2m_max[i]}°C</td><td>${d.daily.precipitation_probability_max[i]}%</td></tr>`;
html+='</table>'; document.getElementById('forecast').innerHTML=html;
}
