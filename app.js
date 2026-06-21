
function icon(c){if(c===0)return'☀️';if([1,2,3].includes(c))return'⛅';if([95,96,99].includes(c))return'⛈️';if([51,53,55,61,63,65,80,81,82].includes(c))return'🌧️';return'☁️';}
function cls(v){if(v<20)return'green';if(v<50)return'yellow';if(v<70)return'orange';return'red';}
let map=L.map('map').setView([45.8,16],7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker,tc,wc;
async function loadWeather(){
const p=document.getElementById('place').value;
const g=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(p)+'&count=1');
const gj=await g.json(); if(!gj.results)return;
const r=gj.results[0];
if(marker)map.removeLayer(marker);
marker=L.marker([r.latitude,r.longitude]).addTo(map);
map.setView([r.latitude,r.longitude],10);

const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${r.latitude}&longitude=${r.longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`);
const d=await w.json();

const rain=Math.max(...d.hourly.precipitation_probability.slice(0,24));
const gust=Math.max(...d.hourly.wind_gusts_10m.slice(0,24));
const hail=Math.min(100,Math.round(rain*0.6+Math.max(0,gust-30)));
const storm=Math.min(100,Math.round(rain*0.7+Math.max(0,gust-20)));

document.getElementById('summary').innerHTML=`<div class='card'><h2>${r.name}</h2>🌡️ ${d.current.temperature_2m}°C | 💨 ${d.current.wind_speed_10m} km/h</div>`;
document.getElementById('risk').innerHTML=`<div class='card'>
🧊 Tuča: <span class='${cls(hail)}'>${hail}%</span><br>
🚨 Nevrijeme: <span class='${cls(storm)}'>${storm}%</span>
</div>`;

if(tc)tc.destroy(); if(wc)wc.destroy();
tc=new Chart(tempChart,{type:'line',data:{labels:d.hourly.time.slice(0,24),datasets:[{label:'Temperatura',data:d.hourly.temperature_2m.slice(0,24)}]}});
wc=new Chart(windChart,{type:'line',data:{labels:d.hourly.time.slice(0,24),datasets:[{label:'Udari vjetra',data:d.hourly.wind_gusts_10m.slice(0,24)}]}});

let h='<div class="card"><h3>📅 7 dana</h3><table>';
for(let i=0;i<7;i++){h+=`<tr><td>${icon(d.daily.weather_code[i])}</td><td>${d.daily.time[i]}</td><td>${d.daily.temperature_2m_min[i]}°/${d.daily.temperature_2m_max[i]}°</td><td>${d.daily.precipitation_probability_max[i]}%</td></tr>`;}
h+='</table></div>';
forecast.innerHTML=h;
}
