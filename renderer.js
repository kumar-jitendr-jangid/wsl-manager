var wslOsList = [];
var backupPathList = [];

function bindClickEvent(elementIdentifier, callback) {
    $(elementIdentifier).off('click').click(callback);
}

async function init(){

    let data = await window.electronAPI.wslOsList();

    wslOsList = data.wslOsList;
    backupPathList = data.backupPathList || [];

    wslOsList.map(x => {

        let wslClassName = x.NAME.replace(/[^A-Z0-9]+/ig, "_");
        $("#wsl-list-block").append(`
            <div class="card mt-1">
                <div class="card-header">
                    <div class="d-flex justify-content-between">
                        <div>
                            ${x.NAME}
                        </div>
                        <div>
                            <a class="wsl-action-info-toggle" data-bs-toggle="collapse" href="#${wslClassName}" role="button"
                                aria-expanded="false" aria-controls="${wslClassName}">
                                <i class="arrow fa fa-light fa-angle-down"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="collapse" id="${wslClassName}">
                    <div class="card-body">
                        <a class="${wslClassName}" id="start">
                            <i class="fa-regular fa-circle-play fa-bounce fa-lg p-3 btn" style="color: green;" data-toggle="tooltip" data-placement="top" title="Start ${x.NAME}"></i>
                        </a>
                        <a class="${wslClassName}" id="stop">
                            <i class="fa-regular fa-circle-stop fa-bounce fa-lg p-3 btn" style="color: red;" data-toggle="tooltip" data-placement="top" title="Stop ${x.NAME}"></i>
                        </a>
                        <a class="${wslClassName}" data-bs-toggle="collapse" href="#${wslClassName}-backup-view" id="${wslClassName}-backup-button">
                            <i class="fa-solid fa-cloud-arrow-down fa-bounce fa-lg p-3 btn" data-toggle="tooltip" data-placement="top" title="Backup ${x.NAME}"></i>
                        </a>

                        <div class="collapse" id="${wslClassName}-backup-view">
                            <div class="card-body">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title text-center" id="${wslClassName}-backupLabel">WSL back options</h5>
                                    </div>
                                    <div class="modal-body">
                                        <div class="form-group row">
                                            <label for="pick-folder" id="${wslClassName}-pick-folder" class="col-sm-4 col-form-label"> Select backup file
                                                path : <i class="fa-solid fa-folder-open"></i></label>
                                            <div class="col-sm-8">
                                                <input type="text" readonly class="form-control-plaintext file-path-name" value="">
                                            </div>
                                        </div>
                                        <div class="form-group row">
                                            <label for="backname" class="col-sm-4 col-form-label">Back file name : </label>
                                            <div class="col-sm-8">
                                                <input type="text" class="form-control" id="${wslClassName}-backname"
                                                    placeholder="please enter a name for backup">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-primary run-backup">Start backup</button>
                                    </div>
                                    <div class="${wslClassName}-progress progress">
                                        <div class="${wslClassName}-progress-bar progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    })

    backupPathList.map(x => {
        $(".list-group").last().append(`<li class="list-group-item">${x}</li>`)
    })

    $(".progress").hide();

    bindClickEvent(".wsl-action-info-toggle", function () {
        let btn = $(this);
        let child = btn.find('.arrow');

        if (child.hasClass("fa-angle-down")) {
            child.removeClass("fa-angle-down")
            child.addClass("fa-angle-up")
            child.addClass("fa-fade")
        } else {
            child.removeClass("fa-angle-up")
            child.removeClass("fa-fade")
            child.addClass("fa-angle-down")
        }

        wslOsList.map(x => {
            let wslClassName = x.NAME.replace(/[^A-Z0-9]+/ig, "_");
            bindClickEvent(`.${wslClassName}`, async function () {

                let targetIdValue = $(this).attr("id");

                switch (targetIdValue) {
                    case "start":
                        await window.electronAPI.startWSL(x.NAME);
                        break;
                    case "stop":
                        await window.electronAPI.stopWSL(x.NAME)
                        break;
                    case `${wslClassName}-backup-button`:
                        setupBackup(x.NAME, wslClassName)
                        break;
                }
            })
        })
    })

    $('[data-toggle="tooltip"]').tooltip()

    initBackupListBlock();

}

function setupBackup(wslName, wslClassName) {

    let path;

    $(`#${wslClassName}-pick-folder`).on('click', async function () {
        let filePath = await window.electronAPI.openDirectory();
        $(".file-path-name").val(filePath)
        path = filePath;
    })

    $(".run-backup").on('click', async function () {

        $(this).attr('disabled', true);

        let backupName = $(`#${wslClassName}-backname`).val();

        $(`#${wslClassName}-backupblock`).modal('hide');

        var width = 0;
        $(`.${wslClassName}-progress`).show();
        setInterval(() => {
            if (width == 100) width = 0;
            else width += 1;
            $(`.${wslClassName}-progress-bar`).attr('style', 'width: ' + width.toString() + '%')
        }, 500)

        let resp = await window.electronAPI.makeBackup({
            backupName,
            path,
            wslName
        })

        if (resp == 'done') {
            showSuccess()
        } else {
            showError(resp)
        }
        $(`.${wslClassName}-progress`).hide();
    })
}

function showLoading() {
    Swal.fire({
        title: 'Backup started please wait it will take time depending wsl os size',
        html: `<img src="./assests/img/gg.gif">`,
        showConfirmButton: false
    })
}


function showSuccess() {
    Swal.fire({
        title: 'Finished!',
        icon: 'success',
        timer: 1500
    }).then(()=>{
        location.reload(true);
    })
}


function showError(err) {
    Swal.fire({
        title: err + ' Please wait',
        icon: 'error'
    })
}

function initBackupListBlock() {
    listHtml = '';
    backupPathList.map((x, index) => {
                listHtml += `
                    <tr>
                        <th scope="row">${index}</th>
                        <td> ${x.file_name} </td>
                        <td> ${x.date} </td>
                        <td> <i class="fa-solid fa-arrow-up-right-from-square openFileWindow" data-path=${x.path}></i> </td>
                    </tr>
                `
    })
    let html = `
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">File Name</th>
                <th scope="col">Date</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            ${listHtml}
        </tbody>
    `

    $(".table").append(html).ready(function () {
        // enter code here
        $(".openFileWindow").click(function() {
            console.log("$(this).data('path')", $(this))
            window.electronAPI.showFile($(this).attr('data-path'));
        })
      });

}

init();
