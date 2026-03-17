.open banco_blogf1.db
.mode column

DROP TABLE IF EXISTS participa;
DROP TABLE IF EXISTS Perfil;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Circuitos;
DROP TABLE IF EXISTS gp;
DROP TABLE IF EXISTS temp_equipes;
DROP TABLE IF EXISTS Equipes;
DROP TABLE IF EXISTS Usuario;

CREATE TABLE Usuario (
    id_usuario INTEGER PRIMARY KEY,
    nome TEXT,
    email TEXT,
    senha TEXT
);

CREATE TABLE Equipes (
    id_equipe INTEGER PRIMARY KEY,
    nome TEXT,
    pais TEXT
);

CREATE TABLE temp_equipes (
    id_temp INTEGER PRIMARY KEY,
    ano TEXT
);

CREATE TABLE gp (
    id_circuito INTEGER PRIMARY KEY,
    nome TEXT,
    pais TEXT,
    fk_temp_equipes_id_temp INTEGER,
    FOREIGN KEY (fk_temp_equipes_id_temp)
        REFERENCES temp_equipes(id_temp)
        ON DELETE RESTRICT
);

CREATE TABLE Circuitos (
    id_circuitos INTEGER PRIMARY KEY,
    nome TEXT,
    pais TEXT,
    tamanho TEXT,
    descricao TEXT,
    fk_gp_id_circuito INTEGER,
    FOREIGN KEY (fk_gp_id_circuito)
        REFERENCES gp(id_circuito)
        ON DELETE RESTRICT
);

CREATE TABLE Posts (
    id_post INTEGER PRIMARY KEY,
    conteudo TEXT,
    data_post TEXT,
    titulo TEXT
);

CREATE TABLE Perfil (
    id_perfil INTEGER PRIMARY KEY,
    nome_perfil TEXT,
    fk_Usuario_id_usuario INTEGER,
    FOREIGN KEY (fk_Usuario_id_usuario)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE participa (
    fk_Equipes_id_equipe INTEGER,
    fk_temp_equipes_id_temp INTEGER,
    FOREIGN KEY (fk_Equipes_id_equipe)
        REFERENCES Equipes(id_equipe)
        ON DELETE RESTRICT,
    FOREIGN KEY (fk_temp_equipes_id_temp)
        REFERENCES temp_equipes(id_temp)
        ON DELETE RESTRICT
);