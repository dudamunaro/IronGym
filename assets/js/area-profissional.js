(function () {
  "use strict";

  var students = [
    { id: 1, nome: "Mariana Costa", objetivo: "Condicionamento", acompanhamento: "Hoje · avaliação inicial" },
    { id: 2, nome: "Pedro Almeida", objetivo: "Hipertrofia", acompanhamento: "Ontem · treino" },
    { id: 3, nome: "Beatriz Santos", objetivo: "Treino funcional", acompanhamento: "Segunda · avaliação" },
    { id: 4, nome: "Lucas Ferreira", objetivo: "Acompanhamento", acompanhamento: "Sábado · reavaliação" }
  ];

  var list = document.getElementById("lista-alunos");
  var selectAll = document.getElementById("selecionar-todos");
  var deleteButton = document.getElementById("excluir-selecionados");
  var counter = document.getElementById("contador-alunos");
  var status = document.getElementById("status-alunos");

  if (!list || !selectAll || !deleteButton) return;

  function renderStudents() {
    list.innerHTML = "";

    students.forEach(function (student) {
      var row = document.createElement("div");
      row.className = "linha-aluno";
      row.setAttribute("role", "row");
      row.innerHTML =
        '<span role="cell"><input type="checkbox" class="aluno-checkbox" value="' + student.id + '" aria-label="Selecionar ' + student.nome + '"></span>' +
        '<span role="cell" class="nome-aluno">' + student.nome + '</span>' +
        '<span role="cell">' + student.objetivo + '</span>' +
        '<span role="cell">' + student.acompanhamento + '</span>' +
        '<span role="cell"><span class="situacao">Em acompanhamento</span></span>';
      list.appendChild(row);
    });

    counter.textContent = students.length + " aluno(s) vinculado(s)";
    selectAll.checked = false;
  }

  selectAll.addEventListener("change", function () {
    list.querySelectorAll(".aluno-checkbox").forEach(function (checkbox) {
      checkbox.checked = selectAll.checked;
    });
  });

  deleteButton.addEventListener("click", function () {
    var selected = Array.prototype.map.call(
      list.querySelectorAll(".aluno-checkbox:checked"),
      function (checkbox) {
        return Number(checkbox.value);
      }
    );

    if (selected.length === 0) {
      status.textContent = "Selecione pelo menos um aluno antes de excluir o vínculo.";
      status.style.color = "#ff7587";
      return;
    }

    students = students.filter(function (student) {
      return selected.indexOf(student.id) === -1;
    });

    renderStudents();
    status.style.color = "#65d59c";
    status.textContent = selected.length + " vínculo(s) removido(s) desta área.";
  });

  renderStudents();
})();
