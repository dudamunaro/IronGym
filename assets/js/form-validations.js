(function () {
  "use strict";

  function digits(value) {
    return value.replace(/\D/g, "");
  }

  function maskCpf(value) {
    return digits(value).slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function maskCnpj(value) {
    return digits(value).slice(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function maskCep(value) {
    return digits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  }

  function maskPhone(value) {
    var numbers = digits(value).slice(0, 11);
    if (numbers.length > 10) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }

  function maskDate(value) {
    return digits(value).slice(0, 8)
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2");
  }

  function validCpf(value) {
    var cpf = digits(value);
    if (!cpf || /^(\d)\1{10}$/.test(cpf)) return false;
    var sum = 0;
    for (var i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i), 10) * (10 - i);
    var rest = (sum * 10) % 11;
    if (rest === 10) rest = 0;
    if (rest !== parseInt(cpf.charAt(9), 10)) return false;
    sum = 0;
    for (var j = 0; j < 10; j++) sum += parseInt(cpf.charAt(j), 10) * (11 - j);
    rest = (sum * 10) % 11;
    if (rest === 10) rest = 0;
    return rest === parseInt(cpf.charAt(10), 10);
  }

  function validCnpj(value) {
    var cnpj = digits(value);
    if (!cnpj || /^(\d)\1{13}$/.test(cnpj) || cnpj.length !== 14) return false;
    var factors = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var sum = 0;
    for (var i = 0; i < factors.length; i++) sum += parseInt(cnpj.charAt(i), 10) * factors[i];
    var rest = sum % 11;
    var first = rest < 2 ? 0 : 11 - rest;
    if (first !== parseInt(cnpj.charAt(12), 10)) return false;
    factors = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (var j = 0; j < factors.length; j++) sum += parseInt(cnpj.charAt(j), 10) * factors[j];
    rest = sum % 11;
    var second = rest < 2 ? 0 : 11 - rest;
    return second === parseInt(cnpj.charAt(13), 10);
  }

  var form = document.querySelector("form");
  if (!form) return;
  form.noValidate = true;

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    if (field.type !== "checkbox" && field.type !== "radio") {
      field.classList.add("form-control");
      if (field.tagName === "SELECT") {
        field.classList.remove("form-control");
        field.classList.add("form-select");
      }

      if (field.nextElementSibling && !field.nextElementSibling.classList.contains("mensagem-erro")) {
        var feedback = document.createElement("div");
        feedback.className = "mensagem-erro invalid-feedback";
        feedback.setAttribute("aria-live", "polite");
        field.insertAdjacentElement("afterend", feedback);
      }
    }
  });

  function setError(field, message) {
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
    var feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains("mensagem-erro")) {
      feedback.textContent = message;
      feedback.style.display = "block";
    }
  }

  function clearError(field) {
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
    var feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains("mensagem-erro")) {
      feedback.textContent = "";
      feedback.style.display = "";
    }
  }

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      clearError(field);
    });
    field.addEventListener("change", function () {
      clearError(field);
    });
  });

  var cpf = document.getElementById("cpf");
  var cnpj = document.getElementById("cnpj");
  var cep = document.getElementById("cep");
  var phoneFields = form.querySelectorAll('input[type="tel"]');

  if (cpf) cpf.addEventListener("input", function () { cpf.value = maskCpf(cpf.value); });
  if (cnpj) cnpj.addEventListener("input", function () { cnpj.value = maskCnpj(cnpj.value); });
  if (cep) cep.addEventListener("input", function () { cep.value = maskCep(cep.value); });
  phoneFields.forEach(function (phone) {
    phone.addEventListener("input", function () { phone.value = maskPhone(phone.value); });
  });

  var planoParam = new URLSearchParams(window.location.search).get("plano");
  var planoField = document.getElementById("plano");
  if (planoParam && planoField) planoField.value = planoParam;

  function validateBirth(field) {
    if (!field.value) return "Informe sua data de nascimento.";
    var birth = new Date(field.value + "T00:00:00");
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birth >= today) return "A data de nascimento deve ser anterior a hoje.";
    var age = today.getFullYear() - birth.getFullYear();
    var month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 16) return "É necessário ter pelo menos 16 anos.";
    if (age > 100) return "Informe uma data de nascimento válida.";
    return "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var valid = true;
    var firstError = null;
    var status = document.getElementById("status-formulario");

    function check(field, message) {
      if (!field) return;
      if (!field.value.trim()) {
        setError(field, message);
        valid = false;
        firstError = firstError || field;
      } else {
        clearError(field);
      }
    }

    var name = document.getElementById("nome");
    if (name) {
      var nameValue = name.value.trim();
      var nameParts = nameValue.split(/\s+/).filter(Boolean);
      if (nameParts.length < 2 || nameValue.length < 5) {
        setError(name, "Informe nome e sobrenome (mínimo de 5 caracteres)."); valid = false; firstError = firstError || name;
      } else clearError(name);
    }

    if (cpf) {
      if (!validCpf(cpf.value)) {
        setError(cpf, "Informe um CPF válido."); valid = false; firstError = firstError || cpf;
      } else clearError(cpf);
    }

    var birth = document.getElementById("nascimento");
    if (birth) {
      var birthError = validateBirth(birth);
      if (birthError) { setError(birth, birthError); valid = false; firstError = firstError || birth; } else clearError(birth);
    }

    var email = document.getElementById("email");
    if (email) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email.value.trim())) {
        setError(email, "Informe um e-mail válido."); valid = false; firstError = firstError || email;
      } else clearError(email);
    }

    phoneFields.forEach(function (phone) {
      var numbers = digits(phone.value);
      if (phone.required && !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone.value)) {
        setError(phone, "Use o formato (18) 99999-9999."); valid = false; firstError = firstError || phone;
      } else if (phone.value && numbers.length < 10) {
        setError(phone, "Telefone incompleto."); valid = false; firstError = firstError || phone;
      } else clearError(phone);
    });

    if (cep && cep.value) {
      if (digits(cep.value).length !== 8) {
        setError(cep, "Use o formato 00000-000."); valid = false; firstError = firstError || cep;
      } else clearError(cep);
    }

    var cref = document.getElementById("cref");
    if (cref) {
      if (!/^\d{4,6}-[A-Za-z]\/[A-Za-z]{2}$/i.test(cref.value.trim())) {
        setError(cref, "Use o formato 123456-G/SP."); valid = false; firstError = firstError || cref;
      } else clearError(cref);
    }

    if (cnpj && cnpj.value.trim()) {
      if (!validCnpj(cnpj.value)) {
        setError(cnpj, "Informe um CNPJ válido."); valid = false; firstError = firstError || cnpj;
      } else clearError(cnpj);
    }

    var startDate = document.getElementById("data-inicio");
    if (startDate) {
      if (!startDate.value) {
        setError(startDate, "Informe uma data de início."); valid = false; firstError = firstError || startDate;
      } else {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var selected = new Date(startDate.value + "T00:00:00");
        if (selected < today) {
          setError(startDate, "A data de início não pode ser anterior a hoje."); valid = false; firstError = firstError || startDate;
        } else clearError(startDate);
      }
    }

    var specialty = document.getElementById("especialidade");
    if (specialty) check(specialty, "Selecione uma especialidade.");

    var observations = document.getElementById("observacoes");
    if (observations && observations.hasAttribute("minlength") && observations.value.trim()) {
      if (observations.value.trim().length < 20) {
        setError(observations, "A descrição deve conter pelo menos 20 caracteres."); valid = false; firstError = firstError || observations;
      } else clearError(observations);
    }

    if (!valid) {
      if (status) {
        status.className = "status-formulario status-erro";
        status.textContent = "Corrija os campos destacados antes de continuar.";
      }
      if (firstError) firstError.focus();
      return;
    }

    if (status) {
      status.className = "status-formulario status-sucesso";
      status.textContent = "Cadastro validado com sucesso! Os dados não serão armazenados.";
    }
  });
  var vetDados = [];
  var tabelaDocumentos = document.querySelector("#tb-body");
  var campoDocumento = document.querySelector("#txt-texto");

  function montarTabela(dados) {
    if (!tabelaDocumentos) return;

    var html = "";
    if (dados.length === 0) {
      html =
        '<tr><td colspan="3" class="estado-vazio">' +
        'Nenhum curso ou certificação informado.<br>Use o campo acima para adicionar o primeiro item.' +
        '</td></tr>';
    }
    for (var documento of dados) {
      html += '<tr>' +
        '<td class="coluna-selecao"><input type="checkbox" data-id="' + documento.id + '" aria-label="Selecionar ' + documento.nome + '"></td>' +
        '<td class="coluna">' + documento.nome + '</td>' +
        '<td class="coluna-exclusao"><a href="#" onclick="delDocumento(' + documento.id + '); return false;" class="btnExcluir" aria-label="Excluir ' + documento.nome + '">&times;</a></td>' +
        '</tr>';
    }
    tabelaDocumentos.innerHTML = html;

    var contador = document.getElementById("contador-documentos");
    if (contador) contador.textContent = dados.length + " item(ns)";
  }

  function addDocumento() {
    if (!campoDocumento) return;

    var nome = campoDocumento.value.trim();
    var status = document.getElementById("status-documentos");
    if (nome.length < 3) {
      if (status) {
        status.textContent = "Informe pelo menos 3 caracteres para adicionar o item.";
        status.style.color = "#842029";
      }
      campoDocumento.focus();
      return;
    }

    vetDados.push({ id: new Date().getTime(), nome: nome });
    montarTabela(vetDados);
    campoDocumento.value = "";
    campoDocumento.focus();

    if (status) {
      status.textContent = "Curso ou certificação adicionada à candidatura.";
      status.style.color = "#146c43";
    }
  }

  window.delDocumento = function (idDel) {
    var listaAux = [];
    for (var i = 0; i < vetDados.length; i++) {
      if (String(vetDados[i].id) !== String(idDel)) {
        listaAux.push(vetDados[i]);
      }
    }
    vetDados = listaAux;
    montarTabela(vetDados);

    var status = document.getElementById("status-documentos");
    if (status) {
      status.textContent = "Item excluído da candidatura.";
      status.style.color = "#146c43";
    }
  };

  function excluirSelecionados() {
    var listaCK = document.querySelectorAll("#tb-body [data-id]");
    var algumSelecionado = false;

    for (var ck of listaCK) {
      if (ck.checked) {
        algumSelecionado = true;
        delDocumento(ck.dataset.id);
      }
    }

    var status = document.getElementById("status-documentos");
    if (!algumSelecionado) {
      if (status) {
        status.textContent = "Não há itens selecionados para serem excluídos.";
        status.style.color = "#842029";
      }
    } else if (status) {
      status.textContent = "Itens selecionados excluídos da candidatura.";
      status.style.color = "#146c43";
    }
  }

  function selecionaTodos() {
    var listaCK = document.querySelectorAll("#tb-body [data-id]");
    var ckPai = document.querySelector("#ckTodos");
    for (var ck of listaCK) {
      ck.checked = ckPai.checked;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    montarTabela(vetDados);

    var btnAdd = document.querySelector("#btn-add");
    if (btnAdd) btnAdd.addEventListener("click", addDocumento, false);

    var btnExcluir = document.querySelector("#btnExcluirSelecionados");
    if (btnExcluir) btnExcluir.addEventListener("click", excluirSelecionados, false);

    var ckTodos = document.querySelector("#ckTodos");
    if (ckTodos) ckTodos.addEventListener("click", selecionaTodos, false);
  }, false);
})();
