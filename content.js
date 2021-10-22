//change is a single event..


(function () {
    chrome.storage.onChanged.addListener(function (changes,areaName) {
        console.log("Storage has our thing lets grab it.");


    //removing sync it makes the extension slow due to underlying chrome procedures and adding local version of it.
    chrome.storage.local.get(['gql'], function(result) {
        let ourProgress = result
        //some how managed to share the objects..    
        //perform gql operation over here.
        console.log("GQL, ",result)
        let options = {
            method: 'POST',
            headers: result.gql.gqlHeaders,
            body: result.gql.gqlRequest
        }


        let fetchRes = fetch(
            "https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption", 
                                                    options).then()

            fetchRes.then((res)=>{
                if(res.status == 200){
                    console.log("REPORT API SENT...")
                }
            })

        
            });




        //this is for reporting api..

       // removing sync it makes the extension slow due to underlying chrome procedures and adding local version of it.
        chrome.storage.local.get(['report'], function(result) {
            let ourProgress = result
            //some how managed to share the objects..    
            //perform report operation over here.
            console.log("REPORT HEADERS , ",result.report.reportHeaders)
            let options = {
                method: 'POST',
                headers: result.report.reportHeaders,
                body: result.report.reportRequest
            }
    
    
            let  fetchRes = fetch(
                "https://accenture.percipio.com/api/reporting", 
                                                        options);
    
                fetchRes.then((res)=>{
                    if(res.status == 200){
                        console.log("GQL API SENT...")
                    }
                })
    
            
                });

    

    
    })
})();
