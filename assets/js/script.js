// Variable para guardar la instancia actual del chart segun evento boton
let currentChart = null

//Funcion asincrona para manejar evento boton
const handleClick = async () => {
    const select = document.querySelector("#selectCurrency")
    const dinero = document.querySelector("#dinero")
    const errorMensaje = document.querySelector("#errorMensaje")

    //Asegurarse de que estan ambos campos completos
    if (!select.value || !dinero.value) {
        //alert("Por favor, complete todos los campos antes de continuar")
        errorMensaje.innerText = "*Por favor, complete todos los campos antes de continuar"
        errorMensaje.style.display = "block"
        return
    }
    //Ocultar mensaje de error si estan completos los campos
    errorMensaje.style.display = "none"

    //Obtener datos desde API mindicador.cl
    const endpoint = "https://mindicador.cl/api/" + select.value
    
    //Try/catch para ejecutar fetch y capturar posibles errores indicandolo en el DOM
    try {
        const res = await fetch(endpoint)

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()

        if (!data.serie) {
            throw new Error("Invalid data format")
        }
    
        //Conversion de moneda
        const info = data.serie.slice(0, 10).reverse()
        const etiquetas = info.map(day => {
            return day.fecha.split('T')[0]
        })
        const valores = info.map(day => day.valor)
        const conversion = dinero.value / valores[valores.length - 1]
        
        //Render moneda en DOM
        document.querySelector("h2").innerText = "$" + conversion.toFixed(2)
        
        console.log("etiquetas", etiquetas)
        console.log("valores", valores)
    
        //Creacion del grafico
        const ctx = document.querySelector("#myChart").getContext("2d")
    
         // Destruir el chart previo si es que existe alguno
        if (currentChart) {
            currentChart.destroy();
        }
    
        const dataChart = {
            labels: etiquetas,
            datasets: [
                {
                    label: 'Variaciones de moneda',
                    data: valores,
                    //fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                },
            ],
        }
    
        currentChart = new Chart(ctx, {
            type: 'line',
            data: dataChart,
            
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Valor'
                        }
                    }
                }
            }
            
        })
        //Captura de errores al intentar fetch
    } catch(error) {
        console.error("Error fetching or processing data: ", error)
        //alert("Hubo un error al obtener los datos. Por favor, intente nuevamente.")
        errorMensaje.innerText = "*Hubo un error al obtener los datos. Por favor, intente nuevamente."
        errorMensaje.style.display = "block"
    }
}

//Evento boton
const btnBuscar = document.querySelector("#btn-buscar")
btnBuscar.addEventListener('click', handleClick)