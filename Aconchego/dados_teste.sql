insert into usuario values(6670061501, 'Pedro', 'bjkre@hotmail.com', '123456', 'rua 1', '99999999999');
insert into usuario values(12345678, 'Diego', 'diego.bakugan@hotmail.com', '123456', 'rua 2', '92112534214');
insert into usuario values(12345679, 'Pedritto', 'pedritto@hotmail.com', '123456', 'rua 3', '92112534214');
insert into usuario values(12345698, 'Jorge', 'jorge@hotmail.com', '123456', 'rua 4', '82112534214');
insert into usuario values(112, 'Leo Stronda', 'leo@hotmail.com', '123456', 'rua 4', '82112534214');
insert into usuario values(113, 'Muralha', 'muralha@hotmail.com', '123456', 'rua 4', '82112534214');
insert into usuario values(114, 'Fabinho Giga', 'fabio@hotmail.com', '123456', 'rua 4', '82112534214');



insert into administrador values(06670061501);
insert into profissional values(12345678, 06670061501, 'registro');
insert into paciente values(12345679);
insert into padrinho values(12345698, 12345678, 'UFS', '202000');
insert into profissional values(114, 06670061501, 'registro');
insert into paciente values(112);
insert into paciente values(114);