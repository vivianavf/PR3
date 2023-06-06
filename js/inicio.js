window.addEventListener("DOMContentLoaded", (event) => {
    showContinentsCountries();
})

showContinentsCountries = () => {
    fetch("https://api.teleport.org/api/continents/")
    .then((response) => response.json())
    .then((data) => {
        var continentes = data._links["continent:items"]
        for(let i=0; i<=data.count; i++){   
            if(typeof continentes[i] != 'undefined'){
                fetch(continentes[i].href).then((response) => response.json())
                .then((data) => {
                    console.log(data.geonames_code)
                    var continentename = data.name
                    var div = document.createElement("div")
                    div.setAttribute("id", "div"+i)           
                    div.setAttribute("class","img-div")  
                    div.classList.add("flip-card")
                    div.innerHTML += 
                    `${continentename}
                    <div class="flip-card-inner">
                        <div class="flip-card-front" style="background-image: url('./assets/img/backgrounds/${data.geonames_code}.jpg');" width="fit-content">
                        <h1>${continentename}</h1>
                        </div>
                        <div class="flip-card-back" data-mdb-perfect-scrollbar='true'>  
                        <ul id="paises-list-${continentename}" class="pais-list">
                        </ul>               
                        </div>
                    </div>
                    `
                    document.getElementById("add-continents").appendChild(div)

                    fetch(data["_links"]["continent:countries"].href).then((response) => response.json())
                    .then((data) => {                        
                        data["_links"]["country:items"].forEach(pais => {
                            var list = document.createElement("li")
                            list.setAttribute("id", pais.name)
                            list.setAttribute("class", "pais-name")
                            list.innerHTML += 
                            `<a href="/html/country-info.html?name=${pais.name}&href=${pais.href}" class="pais-link">
                            <div">${pais.name}</div>
                            </a>`
                            document.getElementById("paises-list-"+continentename).appendChild(list)
                        })
                    })
                    .catch((error) => console.log(error)) /*Fetch countries list*/
                    
                })
                .catch((error) => console.log(error)) /*Continents HREF*/
            }          
        }
    })
    .catch((error) => console.log(error)); /*Fetch continents*/ 
}
