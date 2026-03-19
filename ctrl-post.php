<?php
// 1. Receber dados do formulário

$titulo = $_POST['posts_titulo'];
$autor = $_POST['posts_autor'];
$texto = $_POST['posts_texto'];

// 2. Montar instrução SQL (INSERT)

$sql = "
INSERT INTO posts (titulo, autor, texto)
VALUES (:titulo, :autor, :texto);
";

// 3. Conectar com o banco

$pdo = new PDO("sqlite:banco_blog.db");

// 4. Prepared Statement
// pré-compilamos o SQL antes de enviar ao banco

$stmt = $pdo->prepare($sql);

// 5. Passamos os valores antes de executar o comando

$stmt->bindValue(':titulo', $titulo);
$stmt->bindValue(':autor', $autor);
$stmt->bindValue(':texto', $texto);

/**
 * Alternativamente, passar um array associativo
 * ao método execute()
 
 * Exemplo:
 
 * $stmt->execute([
 *  ':c1' => value1,
 *  ':c2' => value2
 *   ]);
 */


// 6. Executamos o comando

$stmt->execute(); # aqui o INSERT é enviado ao banco

// 7. Pegamos o valor do ID do novo registro

$id = $pdo->lastInsertId();

?>

<?php
require "index.php";
?>