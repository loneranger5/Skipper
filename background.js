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

console.log(
'background jobs'
)
let progress ={
    gql : {
        gqlHeaders: null,
        gqlRequest: null
    },
    report: {
        reportHeaders: null,
        reportRequest: null
    }
}

function recordHttp(){
    chrome.webRequest.onBeforeRequest.addListener(
        function(details)
        {   
                
                    chrome.webRequest.onBeforeSendHeaders.addListener(
                        function(details) {
    
                        if(details.url == "https://accenture.percipio.com/api/reporting"){
                            console.log("CAPTURING REQUEST HEADERS reporting>> ",details)
                            if(Object.keys(reportHeaders).length <=10 ){
                                for(let i=0;i< details.requestHeaders.length; i++){
                                    reportHeaders[details.requestHeaders[i].name] = details.requestHeaders[i].value
                                }
                                progress.report.reportHeaders = (reportHeaders)
                            }
                            return
                            
                        }else{
                            console.log("CAPTURING GQL :: ", details)
                            console.log("JSON ARR", details.requestHeaders)
                            if(Object.keys(gqlHeaders).length <=10){
                                for(let i=0;i<details.requestHeaders.length;i++){
                                
                                gqlHeaders[details.requestHeaders[i].name]=details.requestHeaders[i].value;
                                
                            
                            }
                            progress.gql.gqlHeaders = (gqlHeaders)
                            return 
                            
                        }
                    
                        
                        }
                        },
                        {urls: [
                            "https://accenture.percipio.com/api/reporting",
                            "https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption"
                        ]},
                        [ "requestHeaders"]);
                    
            //document.alert(details.requestBody); 
            console.log("URLS :: ", details)
            if(details.url == "https://accenture.percipio.com/api/reporting"){
                //faking the reports, who cares anyway...
                
                var postedString = decodeRawBytes(details)
                console.log("Before Edit : ", postedString)
                let jsonRequestBody =  JSON.parse(postedString)
                jsonRequestBody.params.reportType = "duration"
                jsonRequestBody.params.duration = 300
    
                jsonRequestBody = JSON.stringify(jsonRequestBody)
                progress.report.reportRequest = (jsonRequestBody)
                return
            }
            else if(details.url == "https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption"){
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
                progress.gql.gqlRequest = (mutationQuery)
                // send post request
                
                
                
            
        }
        
    
    
    
    
    
            return
        
            
        },
        {urls: [
            "https://accenture.percipio.com/api/reporting",
            "https://accenture.percipio.com/api/graphql2?query=mutation:contentConsumption"
        ]},
        ['requestBody']
    );






}


chrome.action.onClicked.addListener((tab) => {
    console.log("Apple Clicked Starting the Record Process..")
    recordHttp()
    if(progress.gql.gqlRequest && progress.gql.gqlHeaders && progress.report.reportRequest && progress.report.reportHeaders)
        //json Stringify Corrupts the structure so we go the base64 scheme for maintaining the structure and decode it on the other side.
        
        //removing sync it makes the extension slow due to underlying chrome procedures and adding local version of it.
        chrome.storage.local.set(progress, function() {
        
        console.log('Value is set to ' + JSON.stringify(progress));
        });

    });







