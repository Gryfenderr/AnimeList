// Add Anime in the list
async function addAnime(idanime, urlimg, nomnative, nomromaji, nomenglish, languepref, statut, nbsaisons, nbepisodes, saisonencours, epencours, detailsepsaison, checkboxsf, duree) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    let nompref = "";
    if (languepref == 'EN') {
        nompref = nomenglish;
    } else {
        nompref = nomromaji;
    }
    let film = 0;
    if (checkboxsf==true) {
        film = 1;
    }
    if (nbsaisons=="") {
        nbsaisons = null;
        detailsepsaison = null;
    }
    if (detailsepsaison=="") {
        detailsepsaison = null;
    }
    let detailsadonner = detailsepsaison;
    if (detailsepsaison != null) {
        let newdetailsepsaison = '';
        let lstdetailsepsaison = detailsepsaison.split(',');
        if (lstdetailsepsaison.length != nbsaisons) {
            for (let i = 0; i < nbsaisons; i++) {
                if (i!=0) {
                    newdetailsepsaison += ',';
                }
                newdetailsepsaison += lstdetailsepsaison[i];
            }
            detailsadonner = newdetailsepsaison;
        }
    }
    const { data, error } = await Supabase
        .from(tablename)  
        .insert([{
            idanime: idanime, 
            urlimg: urlimg, 
            nomnative: nomnative, 
            nomromaji: nomromaji, 
            nomenglish: nomenglish, 
            languepref: languepref, 
            nompref: nompref,
            statut: statut, 
            nbsaisons: nbsaisons, 
            nbepisodes: nbepisodes, 
            saisonencours: saisonencours, 
            epencours: epencours, 
            detailsepparsaison: detailsadonner, 
            film: film, 
            duree: duree
        }])
    if (error) console.error(error);
    
    document.querySelector("tbody").innerHTML = '';
    selectList();
    printCounts();
}

async function selectList(orderby = "nompref", asc = true) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    document.querySelector("tbody").innerHTML = '';
    
    const { data, error } = await Supabase
        .from(tablename)  
        .select(`id, idanime, urlimg, nomnative, nomromaji, nomenglish, nompref, languepref, statut, nbsaisons, nbepisodes, saisonencours, epencours, detailsepparsaison, film, duree`)
        .order(orderby, { ascending: asc });
    if (error) console.error(error);
    // console.log("SELECT:", datas);

    setsess({
        nomsess: "letter",
        valsess: ""
    })

    data.forEach(data_ => {
        addAnimeRow({
            id: data_.id,
            img: data_.urlimg,
            title: data_.nompref,
            saisons: data_.nbsaisons,
            episodes: data_.nbepisodes,
            status: data_.statut,
            saisonencours: data_.saisonencours,
            epencours: data_.epencours,
            film: data_.film,
            duree: data_.duree
        });
    });   
}

async function getUser(login, mdp) {
    const { data, error } = await Supabase
        .from('users')  
        .select('name')
        .eq('login', login)
        .eq('mdp', mdp);
    if (error) console.error(error);
    console.log(data);
    
    setsess({
        nomsess: "username",
        valsess: data[0].name
    });
}

function addAnimeRow({ id, img, title, saisons, episodes, status, saisonencours, epencours, film, duree }) {
    const numbers = [0,1,2,3,4,5,6,7,8,9];
    if (numbers.includes(parseInt(title[0]))) {
        if (sessionStorage.getItem('letter') != '#') {
            addLetterInTab('#');
        }
        setsess({
            nomsess: "letter",
            valsess: '#'
        })
    }
    else{
        if (title[0] != sessionStorage.getItem('letter')) {
            setsess({
                nomsess: "letter",
                valsess: title[0]
            })
            addLetterInTab(title[0]);
        }
    }

    const table = document.querySelector("tbody"); // ton tableau doit avoir id="animeTable"
    
    // Création de la ligne
    const tr = document.createElement("tr");

    // Colonne image
    const tdImg = document.createElement("td");
    const imgEl = document.createElement("img");
    imgEl.src = img;
    imgEl.alt = title;
    tdImg.appendChild(imgEl);

    // Colonne titre
    const tdTitle = document.createElement("td");
    tdTitle.textContent = title;

    // Colonne saisons/épisodes
    const tdSeasons = document.createElement("td");
    // console.log(film);
    if (film == 0) {
        if (saisons == 0 || saisons == null) {
            tdSeasons.textContent = "Non renseignée";
        } else {
            tdSeasons.textContent = `${
                status == "watching" || status == "dropped" ? `Saison ${saisonencours}, épisode ${epencours}` : 
                status == "waiting" ? `Saison ${saisonencours}` :
                episodes == null ? `${saisons} saison${saisons > 1 ? "s" : ""}` :
                `${saisons} saison${saisons > 1 ? "s" : ""} (${episodes})`
            }`;
        }
    } else {
        tdSeasons.textContent = duree;
    }
    
    // Colonne statut
    const tdStatus = document.createElement("td");
    tdStatus.classList.add("status", status.toLowerCase()); // ex: status="finished"
    tdStatus.textContent = 
        status === "toview" ? "À voir" :
        status === "watching" ? "En cours" :
        status === "finished" ? "Terminé" :
        status === "waiting" ? "En attente" :
        status === "dropped" ? "Abandonné" :
        status === "restart" ? "Recommencer" :
        "";

    // Colonne actions (boutons)
    const tdActions = document.createElement("td");

    if (status == "watching") {
        const btnNext = document.createElement("button");
        btnNext.classList.add("next-ep");
        btnNext.textContent = "➡️";
        btnNext.value = id;
        
        btnNext.onclick = function(){
            nextep(this.value);
        };
        tdActions.appendChild(btnNext);
    }

    const btnEdit = document.createElement("button");
    btnEdit.classList.add("edit");
    btnEdit.textContent = "⚙️";
    btnEdit.value = id;
    btnEdit.onclick = function(){
        editrow(this.value);
    };

    tdActions.appendChild(btnEdit);

    // On assemble tout dans le tr
    tr.appendChild(tdImg);
    tr.appendChild(tdTitle);
    tr.appendChild(tdSeasons);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    // Ajout dans le tableau
    table.appendChild(tr);
}

function clearModal() {
    document.getElementById('titreSearch').value = '';
    document.getElementById('imgURL').value = '';
    document.getElementById('titrenatif').value = '';
    document.getElementById('titrermji').value = '';
    document.getElementById('titreen').value = '';
    document.getElementById('languepref').value = 'EN';
    document.getElementById('statut').value = 'toview';
    StatutChange('toview');
    // document.getElementById('statut').value = 'finished';
    // StatutChange('finished');
    document.getElementById('seasonCount').value = '';
    document.getElementById('seasonInputs').innerHTML = '';
    document.getElementById('previewImg').style.display = 'none';
    document.getElementById('checkboxsf').checked = false;
    document.getElementById('duree').value = '00:00';

    const divs = document.querySelectorAll('.season-line');
    divs.forEach(div => {
        div.querySelector('input').value = '';
    });

    updateSeasonInputs();
    sfChange();
    getIfAnimeExist(0);
}

function clearModal2() {
    document.getElementById('imgURL-edit').value = '';
    document.getElementById('titrenatif-edit').value = '';
    document.getElementById('titrermji-edit').value = '';
    document.getElementById('titreen-edit').value = '';
    document.getElementById('languepref-edit').value = 'EN';
    document.getElementById('statut-edit').value = 'toview';
    StatutChange('toview');
    document.getElementById('seasonCount-edit').value = '';
    document.getElementById('previewImg-edit').style.display = 'none';
    document.getElementById('checkboxsf-edit').checked = false;
    document.getElementById('duree-edit').value = '00:00';
    updateSeasonInputs();
    sfChange();
}

async function login (login, mdp) {
    await getUser(login, CryptoJS.SHA1(mdp).toString());
    if (sessionStorage.getItem('username') != null || sessionStorage.getItem('username') != "undefined") {
        window.location = "index.html";
    }
}

function setsess({ nomsess, valsess}){
    sessionStorage.setItem(nomsess, valsess);
}

async function getrowinfos(id) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { data, error } = await Supabase
        .from(tablename)  
        .select('*')
        .eq('id', id)
    if (error) console.error(error);
    let data_ = data[0];

    changerowvalues({
        id: data_.id,
        idanime: data_.idanime,
        urlimg: data_.urlimg,
        nomnative: data_.nomnative,
        nomromaji: data_.nomromaji,
        nomenglish: data_.nomenglish,
        languepref: data_.languepref,
        statut: data_.statut,
        nbsaisons: data_.nbsaisons,
        nbepisodes: data_.nbepisodes,
        saisonencours: data_.saisonencours,
        epencours: data_.epencours,
        detailsepparsaison: data_.detailsepparsaison,
        film: data_.film,
        duree: data_.duree
       });
}

function editrow(id) {
    document.getElementById('animeForm-edit').classList.add("show");
    getrowinfos(id);
}

function changerowvalues({id, idanime, urlimg, nomnative, nomromaji, nomenglish, languepref, statut, nbsaisons, nbepisodes, saisonencours, epencours, detailsepparsaison, film, duree}){
    const rowid = document.getElementById('rowid');
    const champ_urlimg = document.getElementById('previewImg-edit');
    const champ_nomnative = document.getElementById('titrenatif-edit');
    const champ_nomromaji = document.getElementById('titrermji-edit');
    const champ_nomenglish = document.getElementById('titreen-edit');
    const champ_languepref = document.getElementById('languepref-edit');
    const champ_statut = document.getElementById('statut-edit');
    const champ_nbsaisons = document.getElementById('seasonCount-edit');
    const div_nbsaisons = document.getElementById('divnbsaison-edit');
    const champ_saisonencours = document.getElementById('currentseason-edit');
    const champ_epencours = document.getElementById('currentep-edit');
    const champ_film = document.getElementById('checkboxsf-edit');
    const champ_duree = document.getElementById('duree-edit');
    const div_duree = document.getElementById('divduree-edit');
    const divsseasonInputs = document.getElementById('seasonInputs-edit');
    const divcurrentsvalues = document.getElementById('currentsvalues-edit');

    rowid.value = id;

    champ_urlimg.src = urlimg;
    if (urlimg == ""){
        champ_urlimg.style.display = 'none';
    }
    else{
        champ_urlimg.style.display = 'block';
    }
    champ_nomnative.value = nomnative;
    champ_nomromaji.value = nomromaji;
    champ_nomenglish.value = nomenglish;
    champ_languepref.value = languepref;

    champ_statut.value = statut;
    if (statut == "watching" || statut == "waiting" || statut == "dropped") {
        divcurrentsvalues.style.display = 'block';
        champ_saisonencours.value = saisonencours;
        champ_epencours.value = epencours;   
    } else {
        divcurrentsvalues.style.display = 'none';
    }

    if (detailsepparsaison != null) {
        detailsepparsaison = detailsepparsaison.split(",")
    }

    champ_film.checked = film;
    if (film === 1) {
        div_nbsaisons.style.display = 'none';
        divsseasonInputs.style.display = 'none';
        div_duree.style.display = 'block';
        champ_duree.value = duree;
    } else {
        div_nbsaisons.style.display = 'block';
        divsseasonInputs.style.display = 'block';
        div_duree.style.display = 'none';
        champ_nbsaisons.value = nbsaisons;
        addSeasonInputs(nbsaisons, detailsepparsaison);
    }
}

function addSeasonInputs(nb, eplist) {
    const count = parseInt(nb);
    const divsseasonInputs = document.getElementById('seasonInputs-edit');
    
    divsseasonInputs.innerHTML = "";

    if (count > 0) {
        divsseasonInputs.innerHTML = "<label>Épisodes / saisons</label>";
        for (let i = 1; i <= count; i++) {
            const div = document.createElement("div");
            div.classList.add("season-line");
            div.innerHTML = `
                <span>Saison ${i} :</span>
                <input type="number" min="1" value="${eplist ? eplist[i-1] : ''}">
            `;
            divsseasonInputs.appendChild(div);
        }
    }
}

async function updaterow(id, nomnative, nomromaji, nomenglish, languepref, statut, nbsaisons, nbepisodes, saisonencours, epencours, detailsepparsaison, film, duree) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    let nompref = "";
    if (languepref == 'EN') {
        nompref = nomenglish;
    } else {
        nompref = nomromaji;
    }
    console.log(nompref);
    let film_ = 0;
    if (checkboxsf==true) {
        film_ = 1;
    }
    if (nbsaisons=="") {
        nbsaisons = null;
        detailsepparsaison = null;
    }
    if (detailsepparsaison=="") {
        detailsepparsaison = null;
    }
    const { data, error } = await Supabase
        .from(tablename)  
        .update({
            nomnative: nomnative, 
            nomromaji: nomromaji, 
            nomenglish: nomenglish, 
            languepref: languepref, 
            nompref: nompref,
            statut: statut, 
            nbsaisons: nbsaisons, 
            nbepisodes: nbepisodes, 
            saisonencours: saisonencours, 
            epencours: epencours, 
            detailsepparsaison: detailsepparsaison, 
            film: film_, 
            duree: duree
        })
        .eq('id', id)
    if (error) console.error(error);
    printCounts();
    printCounts();
}

function addLetterInTab(letter) {
    const table = document.querySelector("tbody"); // ton tableau doit avoir id="animeTable"
    // Création de la ligne
    const tr = document.createElement("tr");
    tr.classList.add('letter-separator');

    const tdLetter = document.createElement('td')
    tdLetter.colSpan = "5";
    tdLetter.innerHTML = letter;

    tr.appendChild(tdLetter);

    table.appendChild(tr);
}

async function getcountrows() {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { count, error } = await Supabase
        .from(tablename)  
        .select('*', {count:'exact',head:true});
    if (error) console.error(error);
    
    sessionStorage.removeItem('nbrows');
    setsess({
        nomsess: "nbrows",
        valsess: count
    });
}

async function getcountrowsfinished() {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { count, error } = await Supabase
        .from(tablename)  
        .select('*', {count:'exact', head:true})
        .eq('statut', 'finished');
    if (error) console.error(error);
    document.getElementById('cptfinish').innerHTML = count + "/" + sessionStorage.getItem('nbrows') + " Terminés";
}

async function getcountrowswatching() {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { count, error } = await Supabase
        .from(tablename)  
        .select('*', {count:'exact',head:true})
        .eq('statut', 'watching');
    if (error) console.error(error);
    document.getElementById('cptcurrent').innerHTML = count + " En Cours";
}

function printCounts() {
    getcountrows();
    getcountrowswatching();
    getcountrowsfinished();
}

async function deleteRow(id) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { data, error } = await Supabase
        .from(tablename)  
        .delete()
        .eq('id', id);
    if (error) console.error(error);
}

async function nextep(id) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { data, error } = await Supabase
        .from(tablename)  
        .select('nbsaisons, nbepisodes, saisonencours, epencours, detailsepparsaison')
        .eq('id', id);
    if (error) console.error(error);
    let datas = data[0];

    let currentep = datas.epencours;
    let currentsaison = datas.saisonencours;
    let details = datas.detailsepparsaison.split(',');
    let newstatus = 'watching';

    currentep += 1;
    if (datas.detailsepparsaison != null) {
        if (currentep > details[currentsaison-1] && currentsaison < details.length) {
            currentep = 1;
            currentsaison += 1;
        }
        if (currentep > details[currentsaison-1] && currentsaison == details.length) {
            currentep -= 1;
            newstatus = 'finished';
        }
    }

    updateEp(id, currentep, currentsaison, newstatus);
}

async function updateEp(id, ep, saison, status) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { data, error } = await Supabase
        .from(tablename)  
        .update({
            statut: status, 
            saisonencours: saison, 
            epencours: ep
        })
        .eq('id', id)
    if (error) console.error(error);
    printCounts();
    selectList();
}

async function getIfAnimeExist(idanime) {
    let tablename = 'list' + sessionStorage.getItem('username').toLowerCase();
    const { data, error } = await Supabase
        .from(tablename)  
        .select('id')
        .eq('idanime', idanime);
    if (error) console.error(error);
    if (data[0] != undefined) {
        document.getElementById('warninginlist').style.display = 'block';
    }
    else{
        document.getElementById('warninginlist').style.display = 'none';
    }
}