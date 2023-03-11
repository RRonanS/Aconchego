insert into usuario values(6670061501, 'Pedro', 'bjkre@hotmail.com', '123456', 'rua 1', '99999999999');
insert into usuario values(12345678, 'Dieguinho Fuboca', 'diego.bakugan@hotmail.com', 'rua 2', '92112534214');
insert into usuario values(12345679, 'Pedritto', 'inutil@hotmail.com', 'rua 3', '92112534214');
insert into usuario values(12345698, 'Joje', 'jojinho@hotmail.com', 'rua 4', '82112534214');

insert into administrador values(6670061501);
insert into profissional values(12345678, 6670061501, 'registro');
insert into paciente values(12345679);
insert into padrinho values(12345698, 12345678, 'UFS', '202000');
