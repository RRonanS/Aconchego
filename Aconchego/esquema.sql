create table usuario(
	cpf bigint not null,
  	nome varchar(45),
  	email varchar(45) not null,
  	senha varchar(45) not null,
  	endereco varchar(45),
    telefone varchar(12),
  	constraint pk_usuario primary key(cpf),
  	constraint uq_usuario_email unique(email)
);

create table administrador(
    cpf bigint not null,
    constraint pk_admnistrador primary key(cpf),
    constraint fk_usuario_admnistrador foreign key(cpf) references usuario (cpf)
);

create table paciente(
	cpf bigint not null,
  	constraint pk_paciente primary key(cpf),
  	constraint fk_usuario_paciente foreign key(cpf) references usuario (cpf)
);

create table anotacao(
	paciente_cpf bigint not null,
  	texto varchar(1000),
  	anotacao_data date,
  	constraint fk_paciente_anotacao foreign key(paciente_cpf) references paciente (cpf)
);

create table profissional(
	cpf bigint not null,
  	cadastrado bigint not null,
  	registro varchar(30) not null,
  	constraint pk_profissional primary key(cpf),
  	constraint fk_usuario_profissional foreign key(cpf) references usuario (cpf),
  constraint fk_admnistrador_profissional foreign key(cadastrado) references administrador (cpf)
);

create table padrinho(
	cpf bigint not null,
  	orientador bigint not null,
  	instituicao varchar(100),
  	matricula varchar(20),
  	constraint pk_padrinho primary key(cpf),
  	constraint fk_usuario_paciente foreign key(cpf) references usuario (cpf),
  constraint fk_profissional_padrinho foreign key(orientador) references profissional (cpf)
);

CREATE TABLE atendimento(
  id_atendimento serial primary key,
  profissional_cpf bigint not null,
  paciente_cpf bigint,
  data_atendimento date,
  tipo varchar(20),
  anotacoes varchar(1000),
  atendimento_status int,
  observacoes varchar(100),
  status_atendimento varchar(30),
  constraint fk_profissional_atendimento foreign key(profissional_cpf) references profissional (cpf),
  CONSTRAINT unique_atendimento UNIQUE (profissional_cpf, paciente_cpf, data_atendimento)
);



create table usuario_imagem(
	usuario_cpf bigint not null,
	imagem bytea,
	constraint pk_imagem primary key(usuario_cpf), a
	constraint fk_usuario_imagem foreign key(usuario_cpf) references usuario(cpf)
);
