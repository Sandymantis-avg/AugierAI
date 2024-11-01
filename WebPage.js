const submitButton = document.getElementById("Enter");
const newProposalButton = document.getElementById("New-Proposal");
const createProposalButton = document.getElementById("Create-Proposal");
const currentProposalTitle = document.getElementById("Proposal-Title");
const currentProposalText = document.getElementById("Proposal-Text");

/* 
This set of code adds an event listener to the "enter" button and calls the ChatGPT OpenAI API with the 
bearer token as authentication. We feed in the promptStatement and the currentProposal (for context) to the
LLM and it will provide us with an output response.
*/
submitButton.addEventListener("click", function() {
    var url = "https://api.openai.com/v1/chat/completions";
    var bearer = 'Bearer ' + "" //INSERT GPT API KEY HERE;
    
    //Assign the user's entered prompt statement as well as the current proposal text to variables
    const currProposal = document.getElementById("Proposal-Text").value;
    const promptStatement = document.getElementById("Prompt-Statement").value;

    //Call the OpenAI Chat GPT API
    fetch(url, {
        method: 'POST', 
        headers: {
            'Authorization': bearer,
            /* Says that the body of the request will be in JSON format, if we did
            application/xml instead, we get an "invalid request error" because the request
            format is not as expected 
            */
            'Content-Type': 'application/json', 
        },
        
        /* We do JSON.stringify to convert this string request into a JSON object, the format that we specified above
        that the API will be expecting. */
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI assistant specializing in " + 
                    "generating and improving proposals for small businesses." +  
                    "Depending on the user's request, your task is to either create " + 
                    "a new proposal based on the information provided or modify an existing proposal to enhance its effectiveness. " + 
                    "When creating a proposal, ensure it is detailed, professional, and tailored to the user's " + 
                    "business needs, highlighting key aspects such as services, pricing, timeline, and unique value " + 
                    "propositions. When modifying an existing proposal, focus on improving clarity, persuasiveness, " +
                    "structure, and any specific areas the user wants to enhance. Keep it to 3-4 sentences "
                },
                {
                    "role": "user",
                    "content": currProposal + promptStatement
                },
            ]
        })
    }).then(response => {
        //Throws an error if the API response is not in JSON format
        return response.json();
    
    }).then(data => {
        //Parse through data object to get the actual response
        const message = data.choices[0].message.content;
        updateResponseText(message);
    });
});

//Using a map to store proposal names along with their respective contents
const proposalMap = new Map();

/* Helper method to update the LLM response text */
const updateResponseText = function(responseText) {
    document.getElementById("Prompt-Response").textContent = responseText;
}

/* Creates a new proposal or updates an old proposal and adds it to the proposalMap */
createProposalButton.addEventListener("click", function() {
    //Default title if none provided
    if (currentProposalTitle.textContent == "") {
        currentProposalTitle.textContent = "Untitled";
    }

    //Only adds new Proposal header if the proposal title is not already used, else updates the proposal with same title
    if (!proposalMap.has(currentProposalTitle.textContent)) {
        proposalMap.set(currentProposalTitle.textContent, currentProposalText.value);
        updateProposalList();
    } else {
        console.log("Proposal already exists. No new button added.");
        proposalMap.set(currentProposalTitle.textContent, currentProposalText.value);
    }
})

/* Create a new Proposal Button on the Proposals List */
const updateProposalList = function() {
    const proposalsList = document.getElementById('Proposals-List');

    const newProposal = document.createElement('button');

    newProposal.classList.add("Proposal-Header");
        
    newProposal.contentEditable = 'false';
    
    // Set default text for the new proposal
    newProposal.innerText = currentProposalTitle.textContent;

    // Append the new proposal to the proposals list
    proposalsList.appendChild(newProposal);
};

/* Helper method to update the title and text of the proposal currently being displayed */
const updateCurrentProposal = function(name, proposal) {
    currentProposalTitle.textContent = name;
    currentProposalText.textContent = proposal;
}

/* Allows users to switch between proposals by clicking on a given proposal's header in the ProposalsList */
document.querySelector('.Proposal-Previews').addEventListener("click", function(event) {
    // Check if the clicked element is a BUTTON
    if (event.target.tagName === 'BUTTON') {
        const clickedProposal = event.target.textContent;

        // Retrieve the content from the Map based on the header's text
        const proposalContent = proposalMap.get(clickedProposal);

        //Update the current proposal textarea and title with the proposal name and content of the clicked element
        updateCurrentProposal(clickedProposal, proposalContent)

        // Display the content
        if (proposalContent != null) {
            document.getElementById('Proposal-Text').value = proposalContent;
        } else {
            console.log("Proposal content not found.");
        }
    }
});
