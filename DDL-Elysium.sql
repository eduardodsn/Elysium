CREATE SCHEMA Elysium;
USE Elysium;
CREATE TABLE IF NOT EXISTS categorias
(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nm_categoria VARCHAR(300) NOT NULL
);

CREATE TABLE IF NOT EXISTS emblemas
(
    id_emblema   INT AUTO_INCREMENT PRIMARY KEY,
    ds_descricao VARCHAR(100) NOT NULL,
    nivel        INT          NOT NULL
);

CREATE TABLE IF NOT EXISTS escolas
(
    id_escola INT           NOT NULL PRIMARY KEY,
    nm_escola VARCHAR(300)  NOT NULL,
    cidade    VARCHAR(300)  NOT NULL,
    uf        VARCHAR(2)    NOT NULL,
    score     INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(500)     NOT NULL,
    email      VARCHAR(200)     NOT NULL,
    senha      VARCHAR(255)     NOT NULL,
    uf         char(2)          NOT NULL,
    cidade     VARCHAR(150)     NOT NULL,
    imagem     BLOB             NOT NULL,
    xp         bigint DEFAULT 0 NOT NULL,
    id_escola  INT              NOT NULL,
    id_emblema INT              NULL,
    token      VARCHAR(255)     NULL,
    tp_usuario INT              NOT NULL,
    CONSTRAINT email
        UNIQUE (email),
    CONSTRAINT usuarios_emblemas_id_emblema_fk
        FOREIGN KEY (id_emblema) REFERENCES emblemas (id_emblema),
    CONSTRAINT usuarios_ibfk_1
        FOREIGN KEY (id_escola) REFERENCES escolas (id_escola)
);

CREATE TABLE IF NOT EXISTS anexos_usuario
(
    id_anexo     INT AUTO_INCREMENT PRIMARY KEY,
    titulo_anexo VARCHAR(300) NOT NULL,
    anexo        VARCHAR(300) NOT NULL,
    id_categoria INT          NOT NULL,
    id_usuario   INT          NOT NULL,
    CONSTRAINT anexos_usuario_ibfk_1
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
        ON DELETE CASCADE,
    CONSTRAINT anexos_usuario_ibfk_2
        FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
);


CREATE TABLE IF NOT EXISTS favoritos
(
    id_favoritos     INT AUTO_INCREMENT PRIMARY KEY,
    palavra_favorita VARCHAR(100) NOT NULL,
    id_usuario       INT          NOT NULL,
    CONSTRAINT favoritos_ibfk_1
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS questionarios
(
    id_questionario INT AUTO_INCREMENT PRIMARY KEY,
    cd_questionario VARCHAR(20) NOT NULL,
    id_usuario      INT         NOT NULL,
    CONSTRAINT questionarios_ibfk_1
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS historico
(
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_questao   INT NOT NULL,
    id_usuario   INT NOT NULL,
    CONSTRAINT hist_questao_fk
        FOREIGN KEY (id_questao) REFERENCES questoes (id_questao)
            ON DELETE CASCADE,
    CONSTRAINT hist_usuario_fk
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
            ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS questoes
(
    id_questao      INT AUTO_INCREMENT PRIMARY KEY,
    ds_questao      VARCHAR(1000) NOT NULL,
    id_usuario      INT           NULL,
    id_questionario INT           NULL,
    CONSTRAINT questoes_ibfk_1
        FOREIGN KEY (id_questionario) REFERENCES questionarios (id_questionario),
    CONSTRAINT questoes_ibfk_2
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS opcoes
(
    id_opcoes  INT AUTO_INCREMENT PRIMARY KEY,
    id_questao INT          NOT NULL,
    ds_opcao   VARCHAR(400) NOT NULL,
    certo      BIT          NOT NULL,
    CONSTRAINT opc_questoes_fk
        FOREIGN KEY (id_questao) REFERENCES questoes (id_questao)
            ON DELETE CASCADE
);