// -------------------------------
// menu ui manager ---------------
// -------------------------------

let sideBar = document.querySelector(".sidebar");

function toggleMenu()
{
	sideBar.classList.toggle("active");
}

// the functions which should run when each page loads
const pageLoadFuncs =
{
    editor: loadEditor,
    weapons: renderWeapons,
    charViewer: updateCharLists
};

function toPage(name)
{
    // iterate over every page                                              and make them inactive
	document.querySelectorAll(".panel").forEach(pageCur =>
    pageCur.classList.remove("active"));

    // make the "name" page active
    console.log(name);

    console.log(document.getElementById(name));

    document.getElementById(name).classList.add("active");

    location.hash = name;

    // run func
    if (pageLoadFuncs[name])
    {
        pageLoadFuncs[name]();
    }

    // check for 404 error
    if (!document.getElementById(name))
    {
        toPage("nf");
    }
}

function loadHash()
{
    const page = location.hash.replace("#", "") || "home";
    toPage(page);
}
window.addEventListener("load", loadHash);
window.addEventListener("hashchange", loadHash);



// -------------------------------
// weapon data loader ------------
// -------------------------------

let weapons = {};
const weaponsLoaded = loadWeaponData();

async function loadWeaponData()
{
    try
    {
        const res = await fetch("weapons.json");
        weapons = await res.json();
        renderWeapons();
    }
    catch(error)
    {
        console.log(error);
        alert("JSON didn't load properly. Make sure you are accessing the github website, or using a localhost, NOT running from a local .html file. This is because your browser will disable loading JSON for safety if you are running from a local file.");
        toPage("home");
    }
}

function renderWeapons()
{
    // get the list/div where buttons will be placed
    let list = document.getElementById("weaponList");

    // clear children
    while (list.firstChild)
    {
        list.removeChild(list.firstChild);
    }

    // iterate over each weapon data
    Object.keys(weapons).forEach(key =>
    {
        // create a new button
        const curButton = document.createElement("button");
        // set the text to the wpn name
        curButton.innerText = weapons[key].name;
        // add an event to show the weapon
        curButton.onclick = () => showWeapon(key);
        // add the btn to the list
        list.appendChild(curButton);
    });
}

function showWeapon(id)
{
    const w = weapons[id];

    // display weapon info
    document.getElementById("weaponInfo").innerHTML = `
        <h2>${w.name}</h2>
        <h3>${w.fireModes} ${w.type}</h3>
        <img src="images/weapons/${w.name}.png" style="width:150px;">
        <p>${w.description}</p>
        
        <h3>Machine Info</h3>
        <p>Fire Mode(s): ${w.fireModes}</p>
        <p>Weapon Type: ${w.type}</p>
        <p>Chambered in: ${w.roundType}</p>
        <p>Mag Capacity: ${w.magCapacity}</p>
        <p>Range: ${w.range}</p>

        <h3>Configuration Info</h3>
        <p>Price: ${w.price}</p>
        <p>Storage Points: ${w.storage}</p>
        <p>Attachment Capabilities: ${w.attachmentAbility}</p>
        <p>Max Target Count: ${w.maxTargets}</p>

        <h3>Attack Info</h3>
        <p>Roll Req.: ${w.successReq}</p>

        <p>Wound: ${w.woundDiceCount} ${w.woundDiceType}</p>
        <p>Wound Spill: ${w.woundSpill}</p>

        <p>Stress: ${w.woundDiceCount} ${w.woundDiceType}</p>
        <p>Stress Spill.: ${w.stressSpill}</p>
    `;
}


// -------------------------------
// character creator -------------
// -------------------------------

// container for all characters
let characters = [];

let currentCharacter = {};

const classSelect = document.getElementById("charClass");
const weaponSelect = document.getElementById("charPrimary");
const nameInput = document.getElementById("charName");

newCharacter();

async function loadEditor()
{
    await weaponsLoaded;

    weaponSelect.innerHTML = "";

    Object.keys(weapons).forEach(key =>
    {
        const option = document.createElement("option");

        option.value = key;
        option.innerText = weapons[key].name;

        weaponSelect.appendChild(option);
    });

    updateCharLists();
}

function newCharacter()
{
    // completely new character
    currentCharacter =
    {
        id: Date.now().toString()
    };

    clearCreator();
    updateEditor();
}

function clearCreator()
{
    nameInput.value = "";
    classSelect.value = "";
    weaponSelect.value = "";
}

function deleteCharacter()
{
    const index = characters.findIndex(c => c.id === currentCharacter.id);

    if (index !== -1)
    {
        characters.splice(index, 1);
    }

    localSaveCharacters();
}

function saveCharacter()
{
    currentCharacter["name"] = nameInput.value;
    currentCharacter["class"] = classSelect.value;
    currentCharacter["primary"] = weaponSelect.value;
    currentCharacter["id"] = currentCharacter.id;

    const index = characters.findIndex(c => c.id === currentCharacter.id);

    if (index === -1)
    {
        characters.push(currentCharacter);
    }
    else
    {
        characters[index] = currentCharacter;
    }

    localSaveCharacters();
    updateCharLists();
}

function localSaveCharacters()
{
    localStorage.setItem("characters", JSON.stringify(characters));
    localLoadCharacters();
}

function localLoadCharacters()
{
    characters = JSON.parse(localStorage.getItem("characters")) || [];
}

classSelect.onchange = updateClassImage;
weaponSelect.onchange = updateWeaponImage;

updateEditor();

function updateEditor()
{
    updateWeaponImage();
    updateClassImage();
}

function updateWeaponImage()
{
    const selected =  weaponSelect.value || "Empty";

    const img = document.getElementById("charPrimaryImg");
    img.src = `images/weapons/${selected}.png`;
}

function updateClassImage()
{
    const selected =  classSelect.value || "Empty";

    const img = document.getElementById("charClassImg");
    img.src = `images/classes/${selected}.png`;
}

function updateCharLists()
{
    // get characters from localStorage
    localLoadCharacters();

    // show characters for each list
    renderCharLists();
}

function renderCharLists()
{
    let lists = document.querySelectorAll(".charList");

    lists.forEach(list => {
        // clear children
        while (list.firstChild)
        {
            list.removeChild(list.firstChild);
        }

        // iterate over each weapon data
        characters.forEach(char =>
        {
            // create a new button
            const curButton = document.createElement("button");
            // set the text to the char name
            curButton.innerText = char.id;
        
            // add an event to show the char
            curButton.onclick = () => loadCharacter(char.id);
        
            // add the btn to the list
            list.appendChild(curButton);
        });
    });
}

function loadCharacter(id)
{
    // load the characters
    localLoadCharacters();

    const char = characters.find(c => c.id === id);

    charName.value = char.name;
    charClass.value = char.class;
    charPrimary.value = char.primary;
    
    currentCharacter = char;

    updateEditor();
}