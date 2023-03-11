insert into usuario values(6670061501, 'Pedro', 'bjkre@hotmail.com', '123456', 'rua 1', '99999999999');
insert into usuario values(12345678, 'Diego', 'diego.bakugan@hotmail.com', '123456', 'rua 2', '92112534214');
insert into usuario values(12345679, 'Pedritto', 'pedritto@hotmail.com', '123456', 'rua 3', '92112534214');
insert into usuario values(12345698, 'Jorge', 'jorge@hotmail.com', '123456', 'rua 4', '82112534214');

insert into administrador values(6670061501);
insert into profissional values(12345678, 6670061501, 'registro');
insert into paciente values(12345679);
insert into padrinho values(12345698, 12345678, 'UFS', '202000');
