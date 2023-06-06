window.addEventListener("DOMContentLoaded", (event) => {
    showProvinciasCities();
    countrySalaries();
    showCurrencyPopulation();    
})

let params = (new URL(document.location)).searchParams;
var countryname = params.get("name");
var countryhref = params.get("href");

arrayua = []
/*Fetching all urban areas*/
fetch("https://api.teleport.org/api/urban_areas/").then(response => response.json())
.then(data => {
  data["_links"]["ua:item"].forEach(urbanarea => {
    arrayua.push(urbanarea.name)
  })  
})
.catch(error => console.log(error))


showProvinciasCities = () => {
    document.getElementById("country-info").innerHTML = countryname;
    document.getElementById("country-name").innerHTML = countryname;

    fetch(countryhref)
    .then(response => response.json())
    .then(data => {
        var population = data.population
        var currency = data.currency_code
        var hrefDivisiones = data._links["country:admin1_divisions"].href
        var hrefSalarios = data._links["country:salaries"].href

        population?console.log(population):population=0
        currency?console.log(currency):currency="No currency"

        fetch(hrefDivisiones)
        .then(response => response.json())
        .then(data => {
            if(data.count!=0){
                data._links["a1:items"].forEach(provincia => {
                    var provincianame;
                    typeof provincia.name=='undefined'?provincianame = "No data":provincianame = provincia.name
                    var divprovincia = document.createElement("li")
                    divprovincia.setAttribute("class", "menu-item")
                    document.getElementById("add-provincias").appendChild(divprovincia)
                    var provinciaHTML =
                    `<a href="" class="menu-link menu-toggle">
                    <div id="${provincianame}" style="color:white;">${provincianame}</div>
                    </a>
                    <ul id="add-ciudades-${provincianame}" class="menu-sub">   
                    </ul>
                    `
                    divprovincia.innerHTML += provinciaHTML

                    fetch(provincia.href)
                    .then(response => response.json())
                    .then(data => {                        
                        fetch(data._links["a1:cities"].href)
                        .then(response => response.json())
                        .then(data => {
                            ciudades = data._links["city:items"]  
                            if(ciudades.lenght!=0){
                                ciudades.forEach(ciudad=>{
                                    var ciudadname;
                                    typeof ciudad.name=='undefined'?ciudadname = " ":ciudadname = ciudad.name
                                    var divCiudad = document.createElement("li")
                                    divCiudad.setAttribute("class", "menu-item")
                                    document.getElementById("add-ciudades-"+provincianame).appendChild(divCiudad)
                                    var ciudadHTML =
                                    `<a onclick="showCityInfo(this);" class="menu-link">
                                    <div id="${ciudadname}" style="color:red;">${ciudadname}</div>
                                    </a>
                                    `
                                    divCiudad.innerHTML += ciudadHTML
                                    var fetchCiudad = ciudad.href

                                    var ciudadnorm = ciudadname.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                    
                                    if(arrayua.includes(ciudadnorm)){
                                      document.getElementById(ciudadname).style.color = "white"
                                      /* document.getElementById(provincianame).style.color = "white" */
                                    }
                                })                                
                            }else{
                                console.log("No hay ciudades en"+provincianame)
                            }
                        })
                    })

                })
           }else{
            /* Añadir un div li que diga no data*/
            var divprovincia = document.createElement("li")
            document.getElementById("add-provincias").appendChild(divprovincia)
            var provinciaHTML =
                    `<li class="menu-item">
                        <a class="menu-link">
                        <div">No cities to show</div>
                        </a>                      
                    </li>
                    `
            divprovincia.innerHTML += provinciaHTML
           }            
        })
        .catch(error => console.log(error))
      })
    .catch(error => console.log(error));
    
}

countrySalaries = () => {
    console.log(countryhref)
    fetch(countryhref)
    .then(response => response.json())
    .then(data => {   
        var currency = data.currency_code
        fetch(data._links["country:salaries"].href)
        .then(response => response.json())
        .then(data => {

          if(!data.salaries.length==0){
            salaries = data.salaries
            document.getElementById("chart1")
            chart1.innerHTML = `Salaries per Year (${currency}) in ${countryname}`

            var bestMediumSalary = []
            
            var jobTitles = []
            var bestJob;
            var worstJob;
            salariesjobs = {}
            jobsinfo={}

            salaries.forEach(salary => {
                var job = salary.job["title"]
                var per25 = salary.salary_percentiles["percentile_25"]
                var per50 = salary.salary_percentiles["percentile_50"]
                var per75 = salary.salary_percentiles["percentile_75"]
                salariesjobs[per50] = job
                jobTitles.push(job)
                bestMediumSalary.push(per50)
                jobsinfo[job] = [per25,per50,per75]
                document.getElementById("myDropdown").innerHTML += 
                `<a id="${job}" onclick="createCustomChart(this);">${job}</a>`
            })

            /* Copy to find the index */
            var bestMediumSalary_copy = JSON.parse(JSON.stringify(bestMediumSalary));

            bestMediumSalary.sort(function(a, b){return b-a});

            var top3best = bestMediumSalary.slice(0,3)
            var top3worst = bestMediumSalary.slice(-3)

            /* Show in table best 3 jobs */

            /* Job 1 */
            var index1 = bestMediumSalary_copy.indexOf(top3best[0])            
            var bestjobname = jobTitles[index1]
            var bestsalary = Math.round(top3best[0])                        
            var minsalary = Math.round(jobsinfo[bestjobname][0])
            var maxsalary = Math.round(jobsinfo[bestjobname][2])
            /* Transform currency */
            bestsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0}).format(bestsalary)
            minsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0}).format(minsalary)
            maxsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0}).format(maxsalary)

            document.getElementById("best-1").innerHTML += 
            `<td>${bestjobname}</td>
            <td>${minsalary}</td>
            <td><b>${bestsalary}</b></td>
            <td>${maxsalary}</td>`

            /* Job 2 */
            var index2 = bestMediumSalary_copy.indexOf(top3best[1])   
            var bestjobname = jobTitles[index2]
            var minsalary = Math.round(jobsinfo[bestjobname][0])                     
            var bestsalary = Math.round(jobsinfo[bestjobname][1])            
            var maxsalary = Math.round(jobsinfo[bestjobname][2])
            /* Transform currency */
            bestsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(bestsalary)
            minsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(minsalary)
            maxsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(maxsalary)
            document.getElementById("best-2").innerHTML += 
            `<td>${bestjobname}</td>
            <td>${minsalary}</td>
            <td><b>${bestsalary}</b></td>
            <td>${maxsalary}</td>`

            /* Job 3 */
            var index3 = bestMediumSalary_copy.indexOf(top3best[2])  /*here*/
            var bestjobname = jobTitles[index3]                      /*here*/
            var minsalary = Math.round(jobsinfo[bestjobname][0])                     
            var bestsalary = Math.round(jobsinfo[bestjobname][1])            
            var maxsalary = Math.round(jobsinfo[bestjobname][2])
            /* Transform currency */
            bestsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(bestsalary)
            minsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency , maximumFractionDigits: 0, minimumFractionDigits: 0}).format(minsalary)
            maxsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency , maximumFractionDigits: 0, minimumFractionDigits: 0}).format(maxsalary)
            document.getElementById("best-3").innerHTML +=          /*here*/
            `<td>${bestjobname}</td>
            <td>${minsalary}</td>
            <td><b>${bestsalary}</b></td>
            <td>${maxsalary}</td>`
            /* Show in table worst 3 jobs */

            /* Job 1 */
            var index4 = bestMediumSalary_copy.indexOf(top3worst[2])  /*here*/
            var bestjobname = jobTitles[index4]                      /*here*/
            var minsalary = Math.round(jobsinfo[bestjobname][0])                     
            var bestsalary = Math.round(jobsinfo[bestjobname][1])            
            var maxsalary = Math.round(jobsinfo[bestjobname][2])
            /* Transform currency */
            bestsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(bestsalary)
            minsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency , maximumFractionDigits: 0, minimumFractionDigits: 0}).format(minsalary)
            maxsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency , maximumFractionDigits: 0, minimumFractionDigits: 0}).format(maxsalary)
            document.getElementById("worst-1").innerHTML +=          /*here*/
            `<td>${bestjobname}</td>
            <td>${minsalary}</td>
            <td><b>${bestsalary}</b></td>
            <td>${maxsalary}</td>`

            /* Job 2 */
            var index5 = bestMediumSalary_copy.indexOf(top3worst[1])  /*here*/
            var bestjobname = jobTitles[index5]                      /*here*/
            var minsalary = Math.round(jobsinfo[bestjobname][0])                     
            var bestsalary = Math.round(jobsinfo[bestjobname][1])            
            var maxsalary = Math.round(jobsinfo[bestjobname][2])
            /* Transform currency */
            bestsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(bestsalary)
            minsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(minsalary)
            maxsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(maxsalary)
            document.getElementById("worst-2").innerHTML +=          /*here*/
            `<td>${bestjobname}</td>
            <td>${minsalary}</td>
            <td><b>${bestsalary}</b></td>
            <td>${maxsalary}</td>`

            /* Job 3 */
            var index6 = bestMediumSalary_copy.indexOf(top3worst[0])  /*here*/
            var bestjobname = jobTitles[index6]                      /*here*/
            var minsalary = Math.round(jobsinfo[bestjobname][0])                     
            var bestsalary = Math.round(jobsinfo[bestjobname][1])            
            var maxsalary = Math.round(jobsinfo[bestjobname][2])
            /* Transform currency */
            bestsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency , maximumFractionDigits: 0, minimumFractionDigits: 0}).format(bestsalary)
            minsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency , maximumFractionDigits: 0, minimumFractionDigits: 0}).format(minsalary)
            maxsalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency , maximumFractionDigits: 0, minimumFractionDigits: 0}).format(maxsalary)
            document.getElementById("worst-3").innerHTML +=          /*here*/
            `<td>${bestjobname}</td>
            <td>${minsalary}</td>
            <td><b>${bestsalary}</b></td>
            <td>${maxsalary}</td>`


            bestJob = salariesjobs[Math.max(...bestMediumSalary)]
            worstJob = salariesjobs[Math.min(...bestMediumSalary)]            
            bestSalaries = jobsinfo[bestJob]
            worstSalaries = jobsinfo[worstJob]

            argumentarr = []
            var obj = {};
            obj[bestJob] = bestSalaries;
            argumentarr.push(obj);
            var obj2 = {};
            obj2[worstJob] = worstSalaries;
            argumentarr.push(obj2);
            crearSplineChart(argumentarr)

          }else{
            document.getElementById("changethis").innerHTML = ""
            var div_msg = document.createElement("div")
            div_msg.setAttribute("class", "card")
            div_msg.setAttribute("style", "text-align: center;")
            div_msg.innerHTML = `<span style="font-size: 2.5rem;">No salary data</span>`
            div_msg.innerHTML += `<span class="material-icons" style="font-size: 15rem;">
            work_off
            </span>`

            document.getElementById("changethis").appendChild(div_msg)
          }
            
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
}

crearSplineChart = (arr) => {
  var seriesopt = []
  arr.forEach(element => {
    for(var x in element){
      seriesopt.push({
        name: x,
        data: [Math.round(element[x][0]), Math.round(element[x][1]), Math.round(element[x][2])]
      })
    }
  })
  var options = {
        series: seriesopt,
        chart: {        
        id: 'jobChart',
        height: 350,
        width: 650,
        type: 'area'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0,
          opacityFrom: 0.45,
          opacityTo: 0,
          /* stops: [0, 90, 100] */

        }
      },
      /* fill: {
        type: 'solid',
        colors: ['transparent'],
      }, */
      xaxis: {
        categories: ["Mínimo", "Media", "Máximo"]
      },
      tooltip: {
        x: {
          format: ''
        },
      },
  };

  var chart = new ApexCharts(document.querySelector("#totalRevenueChart"), options);
  chart.render();
    
}

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
}

function createCustomChart(job){
  fetch(countryhref)
  .then(response => response.json())
  .then(data => {
      fetch(data["_links"]["country:salaries"].href)
      .then(response => response.json())
      .then(data => {
        data.salaries.forEach(salary => {

          if(salary.job["title"] == job.innerHTML){
            /* ApexCharts.exec('jobChart', 'destroy') */            

            ApexCharts.exec('jobChart', 'appendSeries', {
              name: salary.job["title"],
              data: [Math.round(salary.salary_percentiles["percentile_25"]), Math.round(salary.salary_percentiles["percentile_50"]), Math.round(salary.salary_percentiles["percentile_75"])]
            });
          }
        })
      })
      .catch(error => console.log(error))
  })
  .catch(error => console.log(error))
  
}

showCurrencyPopulation = () => {
  fetch(countryhref)
  .then(response => response.json())
  .then(data => {
    var currency = data.currency_code
    if(typeof data.currency_code == 'undefined'){
      currency = "No currency"
    }
    document.getElementById("currency-body").innerHTML +=
    `<h3 class="card-title mb-2">${currency}</h3>`
    document.getElementById("popul-body").innerHTML +=
    `<h3 class="card-title text-nowrap mb-1">${Intl.NumberFormat('en-US').format(data.population)}</h3>`

  })
  .catch(error => console.log(error))
}

showCityInfo = (name) => { 
  
  var nombreciudad = name.innerText
  var divprincipal = document.getElementById("layout")
  var slugname = nombreciudad.toLowerCase()
  slugname = slugname.replaceAll(" ", "-")
  slugname = slugname.replaceAll(",", "")
  slugname = slugname.replaceAll(".", "")
  slugname = slugname.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  divprincipal.innerHTML = ""

  urlCity = `https://api.teleport.org/api/urban_areas/slug:${slugname}/`

  console.log(urlCity)

  fetch(urlCity)
  .then(function(response) {
    if(response.status === 200) {
       return response.json();
     }else{

      var divSecundario = document.createElement("div")
      divSecundario.setAttribute("id", "div-secundario")
      divprincipal.appendChild(divSecundario)

      /* No existe la ciudad en Teleport API */
      var tit = document.createElement("h1")
      tit.innerHTML = nombreciudad
      divSecundario.appendChild(tit)
      /* divprincipal.appendChild(tit) */

      var section = document.createElement("section")
      section.innerHTML+=
      `<img class="welcomeImage___2IShg" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDYiIGhlaWdodD0iNjEiIHZpZXdCb3g9IjAgMCA0NiA2MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SW1wb3J0ZWQgTGF5ZXJzPC90aXRsZT48ZyBmaWxsPSIjNTZDMEQxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yMyA2MC40MjRsLS43MTItLjcyMkMyMS4zNzggNTguNzggMCAzNi45NTEgMCAyMy4xIDAgOC42NDEgMTEuNjk0IDAgMjMgMHMyMyA4LjY0MSAyMyAyMy4xYzAgMTMuODUxLTIxLjM3OCAzNS42OC0yMi4yODggMzYuNjAybC0uNzEyLjcyMnpNMjMgMkMxMi42NzcgMiAyIDkuODkzIDIgMjMuMWMwIDExLjY3NiAxNy4yNTEgMzAuNTA0IDIxIDM0LjQ1NyAzLjc0OS0zLjk1MyAyMS0yMi43ODEgMjEtMzQuNDU3QzQ0IDkuODkzIDMzLjMyMiAyIDIzIDJ6Ii8+PHBhdGggZD0iTTIyIDE0aDJ2MThoLTJWMTR6Ii8+PHBhdGggZD0iTTE0IDIyaDE4djJIMTR2LTJ6Ii8+PC9nPjwvc3ZnPg==" alt="Plus Pin">`
      section.innerHTML+=
      `<h2>${nombreciudad} isn't a Teleport City yet...</h2>`
      section.innerHTML+=
      `<div>Don't worry, we regularly add new cities to Teleport and follow where our users drive us.</p></div>`
      divSecundario.appendChild(section)
      /* divprincipal.appendChild(section) */
     }
  })
  .then(data => {
    if(typeof data == 'undefined'){
      console.log("No hay datos")
      return 0;
    }
    /* console.log(urlCity) */

    /* Procesar datos de la ciudad obtenida  */

    /* Añadir html base de la página */
    divprincipal.innerHTML = 
    `
    <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
              <div class="row">
                <div class="col-lg-8 mb-4 order-0" style="width: 100%;height: fit-content;">
                  <div class="card" style="width: 100%;height: 100%;">
                    <div class="d-flex align-items-end row">                      
                        <div id="city-info-body" class="card-body" style="text-align: center;">
                          <h5 id="city-title" class="card-title text-primary">Cargando... </h5>
                          <div id="city-img" class="card-body pb-0 px-0 px-md-4 slideUp hint--bottom">                        
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
                <!-- Total Revenue -->
                <div class="col-12 col-lg-8 order-2 order-md-3 order-lg-2 mb-4">
                  <div class="card">
                    <div class="row row-bordered g-0">
                      <div class="col-md-8">
                        <h5 id="quality-big-title" class="card-header m-0 me-2 pb-3">Life Quality Score</h5>
                        <div id="totalRevenueChart" class="px-2">
                          <table id="quality-of-life" class="charts-css bar show-labels show-primary-axis data-spacing-3">
                            <tbody id="quality-table">

                            </tbody>                            
                          </table>
                          
                        </div>
                      </div>
                      <div class="col-md-4" >
                        <div class="card-body">
                          <div class="text-center">
                            <div class="dropdown">
                              <button
                                class="btn btn-sm btn-outline-primary dropdown-toggle"
                                type="button"
                                id="growthReportId"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                Details
                              </button>
                              <div id="quality-filter" class="dropdown-menu dropdown-menu-end" aria-labelledby="growthReportId">

                              </div>
                            </div>
                          </div>
                        </div>
                        <div id="growthChart"></div>
                        <div id="quality-message" class="text-center fw-semibold pt-3 mb-2"></div>
                        
                      </div>
                    </div>
                  </div>
                </div>
                <!--/ Total Revenue -->
                <!-- Transactions -->
                <div id="filter-div" class="col-md-6 col-lg-4 order-2 mb-4">
                  <div class="card h-100">
                    <div class="card-header d-flex align-items-center justify-content-between">
                      <h5 id="filter-title" class="card-title m-0 me-2">Details</h5>                      
                    </div>
                    <div id="filter-body" class="card-body">
                      <ul id="filter-quality-list" class="p-0 m-0">

                      </ul>
                    </div>
                  </div>
                </div>
                <!--/ Transactions -->
              </div>
              <div class="row">
              </div>
            </div>
            <!-- / Content -->

            <!-- Footer -->
              <footer class="content-footer footer bg-footer-theme">
                <div class="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
                  <div>
                    <a href="https://www.gradient-animator.com/" class="footer-link me-4" target="_blank">CSS Gradient Animator</a>
                    <a href="https://apexcharts.com/" target="_blank" class="footer-link me-4">Apex Charts</a>
                    <a href="https://chartscss.org/" target="_blank" class="footer-link me-4">Charts CSS</a>
                    <a href="https://themewagon.com/themes/free-responsive-bootstrap-5-html5-admin-template-sneat/" target="_blank" class="footer-link me-4">Bootstrap Template</a>                    
                    <a href="http://www.justinaguilar.com/animations/index.html" class="footer-link me-4" target="_blank">CSS Animation CheatSheet</a>
                    <a href="https://kushagra.dev/lab/hint/" class="footer-link me-4" target="_blank">Hint CSS</a>                    
                  </div>
                </div>
              </footer>
              <!-- Footer -->            

            <div class="content-backdrop fade"></div>
          </div>
    `

    cityDetails(data)
    lifeQuality(slugname)
  })
  .catch(error => console.log(error))
}

lifeQuality = (slugname) => {
  var detalles = `https://api.teleport.org/api/urban_areas/slug:${slugname}/details/`

  fetch(detalles).then(response => response.json())
  .then(data => {
      /* console.log(data) */
      for (let i = 0; i <data.categories.length; i+=2) {
          let cat = data.categories[i]
          let acc, acc2, chartscore;
          acc = acc2 = chartscore = 0;

          for (let j = 0; j < cat.data.length; j++) {              
              let scores = cat.data[j]
              if( (scores.label.endsWith("[Teleport score]")) && (scores!=null) ){ 
                  acc += cat.data[j].float_value
                  acc2++
              }
          }

          chartscore = roundToTwo(acc/acc2)          

          /* let color = "green" */

          if(chartscore <= 0.3){
            color = "linear-gradient(90deg, #ff6133, #830000, #ff6133)"
          }else if( (chartscore <= 0.6) && (chartscore > 0.3)){
            color = "linear-gradient(90deg, yellow, #ff5500, yellow)"
          }else if(chartscore >= 0.6){
            color = "linear-gradient(90deg, #b2ff00, #368900, #b2ff00)"
          }

          let element = document.createElement("tr")
          element.innerHTML = 
          `<th id="quality-cat" scope="row">${cat.label}</th>
          <td class="chartscore" style="--size: ${chartscore};
          background: ${color};
	        background-size: 400% 400%;
	        animation: gradient 4.5s ease infinite;
          ">${chartscore}</td>`

          if( (chartscore!=0) && (!isNaN(chartscore)) ){
              document.getElementById("quality-table").appendChild(element)            
          }
      }  

      console.log("Add data")      

      let drop = document.getElementById("quality-filter")
      data.categories.forEach(element => {  

        var linkelement = document.createElement("a")
        linkelement.setAttribute("id", element.id)
        linkelement.setAttribute("class", "dropdown-item")
        linkelement.innerHTML = element.label

        linkelement.addEventListener("click", function(){
          filterQuality(element)
        })

        drop.appendChild(linkelement)        
      })
      
      crearChartBar() 
      
  })
}

function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}

function crearChartBar(){
  let cardColor, headingColor, axisColor, shadeColor, borderColor;

  cardColor = config.colors.white;
  headingColor = config.colors.headingColor;
  axisColor = config.colors.axisColor;
  borderColor = config.colors.borderColor;


  var scores = document.getElementsByClassName("chartscore")    
  var punctuations = 0;
  for (let item of scores) {        
      punctuations += parseFloat(item.innerHTML);
  }
  
  var average = Math.round((punctuations*100)/scores.length);
  var message;

  if(average<=25){
      document.getElementById("quality-message").innerHTML, message = "Quality";
  }else if(25<average<=40){
      document.getElementById("quality-message").innerHTML, message  = "Quality";
  }else if(40<average<=50){
      document.getElementById("quality-message").innerHTML, message = "Quality";
  }else if(50<average<=75){
      document.getElementById("quality-message").innerHTML, message = "Quality";
  }else{
      document.getElementById("quality-message").innerHTML, message = "Quality";
  }

  const growthChartEl = document.querySelector('#growthChart'),
  growthChartOptions = {
    series: [average],
    labels: ['Quality'],
    chart: {
      height: 240,
      type: 'radialBar'
    },
    plotOptions: {
      radialBar: {
        size: 150,
        offsetY: 10,
        startAngle: -150,
        endAngle: 150,
        hollow: {
          size: '55%'
        },
        track: {
          background: cardColor,
          strokeWidth: '100%'
        },
        dataLabels: {
          name: {
            offsetY: 15,
            color: headingColor,
            fontSize: '15px',
            fontWeight: '600',
            fontFamily: 'Public Sans'
          },
          value: {
            offsetY: -25,
            color: headingColor,
            fontSize: '22px',
            fontWeight: '500',
            fontFamily: 'Public Sans'
          }
        }
      }
    },
    colors: [config.colors.primary],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.5,
        gradientToColors: [config.colors.primary],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.6,
        stops: [30, 70, 100]
      }
    },
    stroke: {
      dashArray: 5
    },
    grid: {
      padding: {
        top: -35,
        bottom: -10
      }
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    labels: [message],
  };
if (typeof growthChartEl !== undefined && growthChartEl !== null) {
  const growthChart = new ApexCharts(growthChartEl, growthChartOptions);
  growthChart.render();
}

}

function cityDetails(data){
  document.getElementById("city-title").innerHTML = data.name

  fetch(data["_links"]["ua:images"]["href"]).then(response => response.json())
  .then(data => {
    data["photos"].forEach(photo => {
      document.getElementById("city-img").innerHTML = 
    `
    <img src="${photo["image"]["web"]}" width="100%" height="100%"><script async src="//embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>                          
    `
    var attribution= 
    `
    License: ${photo["attribution"].license} || 
    Photographer: ${photo["attribution"].photographer} || 
    Source: ${photo["attribution"].source}
    `
    document.getElementById("city-img").setAttribute("aria-label", attribution)
    })

    
  })
  .catch(error => console.log(error))
}

function filterQuality(element){
  document.getElementById("filter-title").innerHTML = element.label
  var ulist = document.getElementById("filter-quality-list") 
  ulist.innerHTML="" 

  element.data.forEach(filter_item => {
    var item_name = filter_item.label
    var item_value = 0
    if(filter_item["float_value"]) item_value = filter_item["float_value"]
    if(filter_item["int_value"]) item_value = filter_item["int_value"]
    if(filter_item["currency_dollar_value"]) item_value = filter_item["currency_dollar_value"]
    if(filter_item["type"]=="currency_dollar") item_value = "$"+item_value
    if(filter_item["type"]=="string") item_value = filter_item["string_value"]
    if(filter_item["type"]=="percent") item_value = filter_item["percent_value"]+"%"

    if(!item_name.endsWith("[Teleport score]")){
      var li_item = document.createElement("li")
      li_item.setAttribute("class", "d-flex mb-4 pb-1")
      li_item.innerHTML =
    `<span class="material-icons">chevron_right</span>
     <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
     <div class="me-2">
     <h6 class="mb-0">${item_name}</h6>
     </div>
     <div class="user-progress d-flex align-items-center gap-1">
     <h6 class="mb-0">${item_value}</h6>
     </div>
     </div>
    `
    ulist.appendChild(li_item)
    }
    
  })

}