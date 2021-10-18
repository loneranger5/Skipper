let mutationQuery;
let reportHeaders = {};
let gqlHeaders = {};
let reportHeadersCopy;
let reqStatus;
let reportStatus = 0;
let requestID;
let gqlRequest ;
let jsonRequestBody;
const decodeRawBytes = (details)=>{
    return  decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(details.requestBody.raw[0].bytes)));
}

const encodeRawBytes = (readableString)=>{
    var url = readableString;
    var data = [];
    for (var i = 0; i < url.length; i++){  
        data.push(url.charCodeAt(i));
    }
    
    return data;
}



const init = ()=>{









chrome.webRequest.onBeforeRequest.addListener(
    function(details)
    {   
            
                chrome.webRequest.onBeforeSendHeaders.addListener(
                    function(details) {

                    if(details.url == "https://accenture.percipio.com/api/reporting"){
                        console.log("CAPTURING REQUEST HEADERS reporting>> ",details)
                        reportHeadersCopy = details.requestHeaders
                        if(Object.keys(reportHeaders).length >=12 ){
                            for(let i=0; i<details.requestHeaders.length;i++){
                                reportHeaders[details.requestHeaders[i].name] = details.requestHeaders[i].value;
                            }

                            
                            return
                            
                        }
                        
                        
                    }else{
                        console.log("CAPTURING GQL :: ", details)
                        console.log("JSON ARR", details.requestHeaders)
                        if(Object.keys(gqlHeaders).length != 15)
                        for(let i=0;i<details.requestHeaders.length;i++){
                            
                            gqlHeaders[details.requestHeaders[i].name]=details.requestHeaders[i].value;
                            
                        
                        
                        
                    }
                
                    console.log(gqlHeaders)
                    return 
                    }
                    },
                    {urls: [
                        "https://accenture.percipio.com/api/reporting",
                        "https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption"
                    ]},
                    [ "requestHeaders"]);
                
        //document.alert(details.requestBody); 
        console.log("URLS :: ", details)
        if(details.url == "https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption"){
            //Its not a Netflix to watch bingewatch..lets put a tick to every video.
            
            var postedString  = decodeRawBytes(details)
            console.log("Graphql b4 : ", postedString)
            

            mutationQuery = postedString
            //some regex to edit the query by using naive method

            let startReg = /\"startPos\":\"[0-9]*\"/
            let endPosReg = /\"endPos\":\"[0-9]*\"/
            let sessionDurationReg = /\"sessionDurationSeconds\":[0-9]*/
            mutationQuery = mutationQuery.replace(startReg, `"startPos":"0"`)
            mutationQuery =  mutationQuery.replace(endPosReg, `"endPos":"700"`)
            mutationQuery = mutationQuery.replace(sessionDurationReg, `"sessionDurationSeconds":700`)
            
            console.log("gql AFTER :: ", mutationQuery)
            
            if(Object.keys(gqlHeaders).length >=12  ){
            console.log("I AM GQLHEADER - ", gqlHeaders)
            
            const options = {
                method: 'POST',
                body: mutationQuery,
                headers: gqlHeaders
            }

            
            
            // send post request
            
            fetch("https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption", options)
                .then((res) =>{
                    if(res.status == 200){
                        console.log("Its Reload Time")
                        chrome.runtime.reload();
                    }
                })
                .catch(err => console.error(err));
            

            
        
    }
    





        return
    
}
    },
    {urls: [
        "https://accenture.percipio.com/api/reporting",
        "https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption"
    ]},
    ['requestBody']
);


}







//making our own api call

//ready to send our payload...
init()