<?php

$string_de_conexao = "sqlite:banco_blog.db";
$conn = new PDO($string_de_conexao);

// ===== DADOS DO BLOG =====
$sql_dados_blog = "
SELECT nome, autor, email_adm
FROM blog";

$result_set = $conn->query($sql_dados_blog);
$uma_linha = $result_set->fetch(PDO::FETCH_ASSOC);

$Blog_nome = $uma_linha["nome"];
$Blog_autor = $uma_linha["autor"];
$Blog_email_adm = $uma_linha["email_adm"];

// ===== POSTS =====
$sql_dados_posts = "
SELECT id_post, titulo, conteudo, data_post
FROM posts
ORDER BY data_post DESC";

$result_set_posts = $conn->query($sql_dados_posts);

?>