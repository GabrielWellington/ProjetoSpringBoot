package com.trabalho.agenda.service;

import com.trabalho.agenda.model.Usuario;
import com.trabalho.agenda.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository){
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id){
        return usuarioRepository.findById(id);
    }

    public Usuario salvar(Usuario usuario){
        return usuarioRepository.save(usuario);
    }

    public void deletar(Long id){
        usuarioRepository.deleteById(id);
    }

    public Optional<Usuario> buscarPorEmailESenha(String email, String senha){
        return usuarioRepository.findByEmailAndSenha(email, senha);
    }
}
